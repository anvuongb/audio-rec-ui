import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import {urlBase, versionNumber} from '../constant/url'
import { useEffect, useState } from 'react'
import axios from 'axios'

const name = 'TrueID Biometrics'
export const siteTitle = 'TrueID Biometrics Demo Website'

export default function Layout({ children, home, login, signup, face, transition, profile, reset }) {
  const [apiVersion, setApiVersion] = useState("0.0.0");
  const getApiVersion = async() => {
    try {
      const response = await axios.get(
        urlBase + '/api/version'
      );
        const d = response.data
        setApiVersion(d)
    }
    catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    getApiVersion();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className={styles.header}>
        {home ? (
          !profile &&
          <>
            <Image
              priority
              src="/images/logo_2.png"
              className={utilStyles.borderCircle}
              height={144}
              width={144}
              alt={name}
            />
            <h1 className={utilStyles.heading2Xl}>{name}</h1>
          </>
        ) : (
          !profile &&
          <>
            <Link href="/">
              <a>
                <Image
                  priority
                  src="/images/logo_2.png"
                  className={utilStyles.borderCircle}
                  height={108}
                  width={108}
                  alt={name}
                />
              </a>
            </Link>
            <h2 className={utilStyles.headingLg}>
              <Link href="/">
                <a className={utilStyles.colorInherit}>{name}</a>
              </Link>
            </h2>
          </>
        )}
        {profile ? (
          <>
          <>
            <Link href="/">
              <a>
                <Image
                  priority
                  src="/images/logo_2.png"
                  className={utilStyles.borderCircle}
                  height={108}
                  width={108}
                  alt={name}
                />
              </a>
            </Link>
            <h2 className={utilStyles.headingLg}>
              <Link href="/">
                <a className={utilStyles.colorInherit}>{name} profile page</a>
              </Link>
            </h2>
          </>
          </>
        ) : (
          <>
          </>
        )
        }
        {face ? (
          <>
          MFA Face login page
          </>
        ) : (
          <>
          </>
        )
        }
        {login ? (
          <>
          Login page
          </>
        ) : (
          <>
          </>
        )
        }
        {signup ? (
          <>
          Signup page
          </>
        ) : (
          <>
          </>
        )
        }
        {reset ? (
          <>
          Reset MFA page
          </>
        ) : (
          <>
          </>
        )
        }
      </header>
      <main>{children}</main>
      {!home && !transition && (
        <div className={styles.backToHome}>
          <Link href="/">
            <a>← Back to home</a>
          </Link>
        </div>
      )}
      <div>
          <div className={styles.phantomStyle} />
          <div className={styles.footerStyle}>
              { <small>ui@{versionNumber} - api@{apiVersion}</small> }
          </div>
          <div className={styles.phantomStyle} />
          <div className={styles.footerStyleNote}>
              { <small>© 2021 TrueID</small> }
          </div>
      </div>
    </div>
  )
}
