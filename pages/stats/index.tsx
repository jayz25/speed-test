import { GlobalStats } from '../../components/GlobalStats'
import Layout from '../../components/Layout'
import YourResults from '../../components/YourResults'
import { isStatsApiEnabled } from '../../redux/stat'

const IndexPage = () => (
  <Layout title="SpeedType — Stats">
    <h1 className="sr-only">Stats</h1>
    <div className="flex flex-col gap-10 w-full max-w-3xl">
      <section aria-labelledby="your-results-heading">
        <h2 id="your-results-heading" className="text-2xl font-bold mb-4">Your results</h2>
        <YourResults />
      </section>
      {isStatsApiEnabled && (
        <section aria-labelledby="leaderboard-heading">
          <h2 id="leaderboard-heading" className="text-2xl font-bold mb-4">Global leaderboard</h2>
          <GlobalStats />
        </section>
      )}
    </div>
  </Layout>
)

export default IndexPage
