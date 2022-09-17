import { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";

const LoginComponent = () => {
    const [userName, setUserName] = useState();
    const [password, setPassword] = useState();
    const { loginRequest } = useContext(AuthContext);


    return (
            <>
                <form onSubmit={loginRequest}>
                    <input className="border-4" type="text" name="username" value={userName} />
                    <input className="border-4" type="password" name="password" value={password} />
                    <button type="submit">Submit</button>
                </form>
            </>
    )
}
export default LoginComponent;