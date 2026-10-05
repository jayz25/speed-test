import { GlobalStats } from '../../components/GlobalStats'
import Layout from '../../components/Layout'

const IndexPage = () => (
  <Layout title="SpeedType — Stats">
    <h1 className="sr-only">Stats</h1>
    <GlobalStats />
  </Layout>
)

export default IndexPage
