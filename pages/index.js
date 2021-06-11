import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import {getSortedPostsData} from '../lib/posts'

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Home({allPostsData}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>An in-development demo page for biometrics authentication</p>
        <p>
          Go to <Link href="/signup">
            <a>sign-up</a>
          </Link> page to start 
        </p>
        <p>
          Already registered? You can check your information after <Link href="/login">
            <a>logging in</a>
          </Link>
        </p>

        <p>
          Having trouble logging in? You can reset your MFA records or change password <Link href="/reset">
            <a>here</a>
          </Link>
        </p>
      </section>
    </Layout>
  )
}
