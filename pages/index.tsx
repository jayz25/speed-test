import Home from '../components/Home'
import Layout from '../components/Layout'
import { withAuth } from '../components/withAuth';
import {AuthProvider} from '../context/AuthContext';
import ProtectedRoute from '../utils/PrivateRoute';

const IndexPage = (props) => (
  <Layout title="Home | Type Speed Test">
    <AuthProvider>
      <Home />
    </AuthProvider>
  </Layout>
)

export default (IndexPage);
