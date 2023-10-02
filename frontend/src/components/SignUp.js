import { useState } from 'react';
import { Navigate } from "react-router-dom";
import axios from "axios";

function SignUp(props) {

    const [signUpForm, setSignUpForm] = useState({
        email: "",
        password: ""
    })
    const [success, setSuccess] = useState(false);

    function signUp(event) {
        event.preventDefault()

        axios({
            method: "POST",
            url: "/signup",
            data: {
                email: signUpForm.email,
                password: signUpForm.password
            }
        })
        .then((response) => {
            props.setMessage(response.data.message);
            setSuccess(true);
        })
        .catch((error) => {
            if (error.response) {
                props.setMessage(error.response.data.message)
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
        })

        setSignUpForm({
            email: "",
            password: ""
        })
    }

    function handleChange(event) {
        const { value, name } = event.target
        setSignUpForm(prevState => ({
            ...prevState, [name]: value
        })
        )
    }

    return success ? <Navigate to="/signin" replace /> : (
        <div>
            <h1>Sign Up</h1>
            <form className="signUp">
                <input onChange={handleChange}
                    type="email"
                    text={signUpForm.email}
                    name="email"
                    placeholder="Email"
                    value={signUpForm.email} />
                <input onChange={handleChange}
                    type="password"
                    text={signUpForm.password}
                    name="password"
                    placeholder="Password"
                    value={signUpForm.password} />

                <button onClick={signUp}>Submit</button>
            </form>
        </div>
    );
}

export default SignUp;