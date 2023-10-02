import { useState } from 'react';
import { Navigate } from "react-router-dom";
import axios from "axios";

function SignIn(props) {

    const [signInForm, setSignInForm] = useState({
        email: "",
        password: ""
    })

    function signIn(event) {
        event.preventDefault()

        axios({
            method: "POST",
            url: "/signin",
            data: {
                email: signInForm.email,
                password: signInForm.password
            }
        })
        .then((response) => {
            props.setToken(response.data.access_token)
            props.setRefreshToken(response.data.refresh_token)
        }).catch((error) => {
            if (error.response) {
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
        })

        setSignInForm({
            email: "",
            password: ""
        })
    }

    function handleChange(event) {
        const { value, name } = event.target
        setSignInForm(prevState => ({
            ...prevState, [name]: value
        })
        )
    }
    
    return props.token ? <Navigate to="/create-org" replace /> : (
        <div>
            <h1>Sign In</h1>
            <form className="login">
                <input onChange={handleChange}
                    type="email"
                    text={signInForm.email}
                    name="email"
                    placeholder="Email"
                    value={signInForm.email} />
                <input onChange={handleChange}
                    type="password"
                    text={signInForm.password}
                    name="password"
                    placeholder="Password"
                    value={signInForm.password} />

                <button onClick={signIn}>Submit</button>
            </form>
        </div>
    );
}

export default SignIn;