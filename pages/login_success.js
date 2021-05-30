
import Layout from '../components/layout'
import { useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'

function Signup() {
  const r = useRouter()
  if (r.query.next_step === "done") {
    useEffect(() => {
      setTimeout(
          () => {r.push('/profile?user='+r.query.user+'&token='+r.query.token)},
          3000,
      )
    });
  } else if (r.query.next_step === "biometrics_face"){
    useEffect(() => {
      setTimeout(
          () => {r.push('/login_face?user='+r.query.user+'&token='+r.query.token)},
          3000,
      )
    });
  }
  else if (r.query.next_step === "biometrics_voice"){
    useEffect(() => {
      setTimeout(
          () => {r.push('/login_voice'+r.query.user+'&token='+r.query.token)},
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
    {r.query.next_step==="done" ? <>Login success, redirecting to dashboard page</> : <>Your account has MFA enabled, directing you to next step</>}
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

export default Signup
