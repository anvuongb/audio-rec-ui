
import Layout from '../components/layout'
import { useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'

function MFASuccess() {
  const r = useRouter()
  if (r.query.op === "add" || r.query.op === "remove"){
    useEffect(() => {
      setTimeout(
          () => {r.push('/login')},
          3000,
      )
    });
  }

  return (
    <Layout transition>
    <div style={{
        display:"flex",
        justifyContent:"center",
    }}>
    {r.query.op === "add" && <>Add MFA success, redirecting to login page</> } 
    {r.query.op === "remove" &&(<>Remove MFA success, redirecting to login page</>)}
    </div>
    <>
    <div style={{
        display:"flex",
        justifyContent:"center",
    }}>
        
      <Image
        priority
        src="/images/loading.gif"
        className={utilStyles.borderCircle}
        height={100}
        width={100}
        />
    </div>
    </>

    <style jsx>{`
        .login {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justifyContent: center;
        }
      `}</style>
    </Layout>
  )
}

export default MFASuccess
