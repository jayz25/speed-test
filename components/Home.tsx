import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AuthContext from "../context/AuthContext";
import { apiCall } from "../redux/paragraph";
import { AppDispatch } from "../types/types";
import Paragraphs from "./Paragraphs"
import TypeHere from "./TypeHere"
import ProtectedRoute  from "../utils/PrivateRoute"
import jwtDecode from "jwt-decode";

export const Home = () => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(apiCall());
    },[]);
    return (
            <>
                <h1>Welcome user</h1>
                <Paragraphs />
                <TypeHere />
            </>
        )

}

export default Home;