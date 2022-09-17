import jwtDecode from "jwt-decode";
import { useRouter } from "next/router";
import { useState } from "react";

const { createContext } = require("react");

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    const router = useRouter();
    let decodedToken;
    const loginRequest = async (e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:8000/user_api/token/", {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                'username': e.target.username.value,
                'password': e.target.password.value,
            })
        });
        const data = await response.json();
        if(response.status === 200) {
           localStorage.setItem('access', data.access);
           localStorage.setItem('refresh', data.refresh);
           router.replace("/");
        }
        else {
            alert("Something went wrong while logging in")
        }

    }
    let contextData = {
        user: decodedToken?.username,
        loginRequest: loginRequest,
    }
    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}