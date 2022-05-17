import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import {getSortedPostsData} from '../lib/posts'
import DisplayLoginRecords from '../components/displayLoginRecords'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Record({allPostsData}) {
  return (
    <Layout profile>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        {<DisplayLoginRecords/>}
      </section>
    </Layout>
  )
}
