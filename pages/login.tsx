import Layout from "../components/Layout";
import LoginComponent from "../components/Login";
import {AuthProvider} from '../context/AuthContext';


const Login = () => (
    <Layout title="Login | Speed Test">
        <AuthProvider>
            <LoginComponent />
        </AuthProvider>
    </Layout>
)
export default Login;