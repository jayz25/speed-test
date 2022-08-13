import Link from 'next/link'
import Layout from '../components/Layout'
import Paragraphs from '../components/Paragraphs'
import Timer from '../components/Timer'
import TypeHere from '../components/TypeHere'

const IndexPage = () => (
  <Layout title="Home | Type Speed Test">
    <TypeHere />
  </Layout>
)

export default IndexPage
