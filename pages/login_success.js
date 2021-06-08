
import Layout from '../components/layout'
import { useRouter} from 'next/router'
import {useEffect, useState} from 'react'
import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'

function LoginSuccess() {
  const r = useRouter()

  if (r.query.next_step === "done") {
    useEffect(() => {
      setTimeout(
          () => {r.push('/profile?user='+r.query.user+'&token='+r.query.token)},
          2000,
      )
    }, []);
  } else if (r.query.next_step === "biometrics_face"){
    useEffect(() => {
      setTimeout(
          () => {r.push('/login_face?user='+r.query.user+'&token='+r.query.token)},
          2000,
      )
    }, []);
  }
  else if (r.query.next_step === "biometrics_voice"){
    useEffect(() => {
      setTimeout(
          () => {r.push('/login_voice?user='+r.query.user+'&token='+r.query.token)},
          2000,
      )
    }, []);
  }

  return (
    <Layout transition>
    <div style={{
        display:"flex",
        justifyContent:"center",
    }}>
    {r.query.next_step==="done" ? <>Login success, redirecting to dashboard page</> : <>Your account has {r.query.next_step==="biometrics_voice" ? (<>voice-based</>):(<></>)}{r.query.next_step==="biometrics_face" ? (<>face-based</>):(<></>)} MFA enabled, directing you to next step</>}
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

export default LoginSuccess
