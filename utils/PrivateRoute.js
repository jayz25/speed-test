import jwtDecode from "jwt-decode";
import { useRouter } from "next/router"
import React, { useEffect } from "react";

const ProtectedRoute = (ProtectedComponent) => {
   const updateToken = async () => {
      console.log("updating token")
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      console.log(access)

      const { exp } = jwtDecode(access);
      if (exp*1000 <= (Date.now())) {
         console.log('Token expired');
         try {
            const refetchToken = await fetch("http://127.0.0.1:8000/user_api/token/refresh/", {
               method: 'POST',
               headers: {
                  'Content-type': 'application/json',
               },
               body: JSON.stringify({
                  'refresh': refresh,
               }),
            });
            const newToken = await refetchToken.json();
            console.log('got new token')
            localStorage.setItem('access', newToken.access);
         }catch(err) {
            console.log(err);
            return false;
         }
      }
      else {
         console.log('Token not expired');
      }
   return true;
   }

   return (props) => {
      const Router = useRouter();
      let userIsLoggedIn;
      console.log('Before Effect')
      useEffect(()=> {
         console.log('In effect')
         userIsLoggedIn = localStorage.getItem("access") ? updateToken() : false;
         if (!userIsLoggedIn) {
            Router.replace("/login");
         }
      });
      console.log('After Effect')
      if(userIsLoggedIn){ // TRY USING STATE HERE MAYBE?
         return <ProtectedComponent {...props} />
      }else{
         console.log('Returnning null  ')
         return null;
      }

   }
}

export default ProtectedRoute;