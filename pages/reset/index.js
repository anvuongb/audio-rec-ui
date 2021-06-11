import Head from 'next/head'
import Link from 'next/link'
import Layout, { siteTitle } from '../../components/layout'
import utilStyles from '../../styles/utils.module.css'

export default function Reset() {
  return (
    <Layout reset>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>
          To remove all MFA methods:  <Link href="/reset/mfa">
            <a>Reset MFA</a>
          </Link> 
        </p>

        <p>
          To change password by face authentication:  <Link href="/reset/password/face">
            <a>Face authenticate</a>
          </Link> 
        </p>

        <p>
          To change password by voice authentication:  <Link href="/reset/password/voice">
            <a>Voice authenticate</a>
          </Link>
        </p>
      </section>
    </Layout>
  )
}
