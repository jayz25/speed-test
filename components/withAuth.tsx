import jwtDecode from "jwt-decode";
import { NextComponentType } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const withAuth = (
    Component: NextComponentType
  ) => ({
    ...props
  }) => {

    let decodedToken;
    let username;
    const router = useRouter();
    useEffect(()=> {

    Component.getInitialProps = async () => {

        try {
          const token = localStorage.getItem("accessToken");
          decodedToken = jwtDecode(token);
          username = decodedToken.username;
          console.log("in initialProps", username);
          router.replace("/");
      } catch(err) {
          router.replace("/login");
          console.log("Oops Something went wrong, trying to redirect to login");
      }
    }
  });

    if(username) {
      // return <Component props={props} username = {username} />
      console.log("username is", username)
      return null;
    } else {
      console.log("Returning Null from withAuth");
      return null
    }
};