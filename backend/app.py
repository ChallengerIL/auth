from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_jwt
from werkzeug.security import generate_password_hash, check_password_hash
import re
# config data from config.py
from config import Config
# migrate

from flask_migrate import Migrate

EMAIL_VALIDATION_RE = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'


def check_email(email):
    if(re.fullmatch(EMAIL_VALIDATION_RE, email)):
        return True
    return False


# create the app
app = Flask(__name__)

# from config file
app.config.from_object(Config)

app.config['SQLALCHEMY_DATABASE_URI']
app.config['JWT_SECRET_KEY']
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
# disables a feature that automatically tracks modifications to objects and emits signals 
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']

# this variable, db, will be used for all SQLAlchemy commands
db = SQLAlchemy(app)

app.app_context().push()

migrate = Migrate(app, db)

jwt = JWTManager(app)

user_organization = db.Table(
    'user_organization',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('organization_id', db.Integer, db.ForeignKey('organization.id'))
    )


# class represent a table in database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)  # Changed from username to email
    password = db.Column(db.String(1000), nullable=False) #hashed password, length increased from 80 to 1000

    def serialize(self):
        return {"id": self.id,
                "email": self.email,}


class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    users = db.relationship("User", secondary=user_organization, backref="organizations", lazy=True)

    def serialize(self):
        return {"id": self.id,
                "name": self.name,
                "user_id": self.user_id,
                "users": [user.email for user in self.users]}
    

with app.app_context():
    db.create_all()


@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))

        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()

            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = jsonify(data)

        return response
    
    except (RuntimeError, KeyError):
        return response
    

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    
    return jsonify({"access_token": access_token}), 200


@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    if not check_email(data["email"]):
        return jsonify({"message": "Please provide a valid email address."}), 401

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 409

    hashed_password = generate_password_hash(data['password'], method='sha256')
    
    if check_password_hash(hashed_password, data['password']):
        new_user = User(email=data['email'], password=hashed_password)  # Modified here
        db.session.add(new_user)
        db.session.commit()
    else:
        return jsonify({"message": "Password hashing went wrong"})
    
    return jsonify({"message": "User created!"}), 201


@app.route('/signin', methods=['POST'])
def signin():    
    data = request.get_json()

    if not check_email(data["email"]):
        return jsonify({"message": "Please provide a valid email address."}), 401

    user = User.query.filter_by(email=data['email']).first()  # Modified here
    # tests log

    print("Req data =>", data)
    print("DB query user", user)
    
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401
    
    access_token = create_access_token(identity=user.email)  # Use email as identity
    refresh_token = create_refresh_token(identity=user.email)

    return jsonify({"access_token": access_token, "refresh_token": refresh_token}), 200


@app.route("/signout", methods=["POST"])
@jwt_required()
def signout():
    response = jsonify({"message": "logout successful"})
    unset_jwt_cookies(response)
    return response, 200


@app.route('/create-org', methods=['POST'])
@jwt_required()
def create_org():
    data = request.get_json()
    current_user = get_jwt_identity()

    if Organization.query.filter_by(name=data["name"]).first():
        return jsonify({"message": "Name already taken"}), 409
    
    user = User.query.filter_by(email=current_user).first()
    
    new_organization = Organization(name=data['name'], user_id=user.id)

    db.session.add(new_organization)
    db.session.commit()

    return jsonify({"message": "Organization created"}), 201


@app.route('/add-users', methods=['POST', 'GET'])
@jwt_required()
def add_user_to_org():
    data = request.get_json()
    
    if not check_email(data["email"]):
        return jsonify({"message": "Please provide a valid email address."}), 401

    user = User.query.filter_by(email=data['email']).first()

    if not user :
        return jsonify({"message": "User with this email does not exist."}), 401

    organization = Organization.query.filter_by(name=data['organization']).first()

    if user in organization.users:
        return jsonify({"message": "The user has already been added before."}), 409

    organization.users.append(user)

    db.session.add(organization)
    db.session.commit()

    return jsonify({"message": "success"}), 200


@app.route('/my-organizations', methods=['GET'])
@jwt_required()
def my_organizations():
    current_user = get_jwt_identity()

    user = User.query.filter_by(email=current_user).first()
    organizations = Organization.query.filter_by(user_id=user.id).all()

    return jsonify({"data": [org.serialize() for org in organizations]}), 200


@app.route('/org-users/<organization_name>', methods=['GET'])
@jwt_required()
def org_users(organization_name):
    current_user = get_jwt_identity()

    user = User.query.filter_by(email=current_user).first()
    organization = Organization.query.filter_by(name=organization_name).first()

    if organization.user_id != user.id:
        return jsonify({"message": "Access denied. The organization is not yours."}), 403

    return jsonify({"data": [user.serialize() for user in organization.users]}), 200


if __name__ == '__main__':
    app.run(debug=True)
