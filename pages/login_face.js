import { useState, useRef, useCallback } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'
import Webcam from "react-webcam";
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid';
import urlBase from '../constant/url'
import Head from 'next/head'


function Login() {
  const router = useRouter() 

  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCam, setShowCam] = useState(true);
  const [retryButton, setRetryButton] = useState(false);

  const [userData, setUserData] = useState({
    error: '',
  })

  function handleRetry() {
    setLoading(false);
    setShowCam(true);
    setRetryButton(false);
    setUserData({ ...userData, error: "" })
    setImgSrc(null);
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })
    setLoading(true);
    setShowCam(false);

    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    
    const imageBase64 = imageSrc.split(";base64,")[1]

    const username = router.query.user
    const token = router.query.token

    try {
      const response = await fetch(urlBase + '/api/login/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
        body: JSON.stringify({"request_id":uuidv4(), "user_name":username, "base64_image_data":imageBase64 }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }
      const r = await response.json()
      const result_code = r.result_code
      const result_message = r.result_message
      const next_step = r.next_step
      const newToken = r.token
      if (result_code === 1 && next_step === "done") {
        router.push('/login_success?next_step=done&user='+username+'&token='+newToken)
      } else if (result_message === 'token invalid') {
        router.push('/login_fail')
      } else {
        setRetryButton(true);
        switch(result_code) {
          case -6:
            if (result_message.includes("liveness")) {
              setUserData({ ...userData, error: "face is not live, please take a live photo" })
            } else {
              setUserData({ ...userData, error: "face quality not accepted" })
            }
            break;
          case -7:
            setUserData({ ...userData, error: "face MFA is not activated" })
            break;
          default:
            setUserData({ ...userData, error: "something went wrong, code " + result_code })
        }
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
      setRetryButton(true);
    }
    setLoading(false)
  }

  return (
    <Layout login>
      <Head>
        <title>Face Login page</title>
      </Head>
      <div className="login">
        <form>
          {!loading && showCam && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{router.query.user}</b>, take a photo to verify your identity
            </div>}
          {loading ? (<>
            <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            Calculating facial attributes ...
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
            </></>) : (<></>)
          }
          {!loading && imgSrc && (
            <img
              src={imgSrc}
            />
          )}
          {!loading && showCam && 
            <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            />
          }
          {userData.error && <p className="error">Error: {userData.error}</p>}
          {!loading && showCam && 
            <button type="submit" onClick={handleSubmit}>Complete MFA</button>
          }
          { retryButton && 
            <button type="submit" onClick={handleRetry}>Retry</button>
          }
        </form>
      </div>
      <style jsx>{`
        .login {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        form {
          display: flex;
          flex-flow: column;
        }

        label {
          font-weight: 600;
        }

        input {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

export default Login
