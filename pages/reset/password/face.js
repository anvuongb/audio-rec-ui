import { useState, useRef, useCallback } from 'react'
import {useRouter} from 'next/router'
import Layout from '../../../components/layout'
import Webcam from "react-webcam";
import utilStyles from '../../../styles/utils.module.css'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid';
import {urlBase, resetToken} from '../../../constant/url'
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

  const [masterToken, setMasterToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [retypePassword, setRetypePassword] = useState(null);
  const [passwdMatch, setPasswdMatch] = useState(false)

  async function checkPassword(e, eType) {
    if (eType === "password") {
      if (e.target.value === retypePassword) {
        setPasswdMatch(true)
      } else {
        setPasswdMatch(false)
      }
    } else {
      if (e.target.value  === password) {
        setPasswdMatch(true)
      } else {
        setPasswdMatch(false)
      }
    }
  }

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

    try {
      const response = await fetch(urlBase + '/api/login/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + resetToken},
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
        setMasterToken(newToken)
      } else {
        setUserData({ ...userData, error: result_message + " code " + result_code })
        setRetryButton(true);
        setMasterToken(null);
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
      setRetryButton(true);
      setMasterToken(null);
    }
    setLoading(false)
  }

  async function handleSubmitChangePasswd(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })
    setLoading(true);
    setShowCam(false);

    try {
      const response = await fetch(urlBase + '/api/change/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Reset-Token': 'Bearer ' + masterToken},
        body: JSON.stringify({"request_id":uuidv4(), "user_name":username, "user_passwd":password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }
      const r = await response.json()
      const result_code = r.result_code
      const result_message = r.result_message

      if (result_code === 1 && result_message.toLowerCase() === "ok") {
        router.push("/reset_success?op=password")
      } else {
        setUserData({ ...userData, error: result_message + " code " + result_code })
        setRetryButton(true);
        setMasterToken(null);
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
      setRetryButton(true);
      setMasterToken(null);
    }
    setLoading(false)
  }

  return (
    <Layout resetpassword>
      <Head>
        <title>Reset password</title>
      </Head>
      {masterToken && <div className="signup">
      <small>Face matched - enter your new password</small>
      <form onSubmit={handleSubmitChangePasswd}>

      <label htmlFor="password">New password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={(event) =>
              {
                setPassword(event.target.value)
                checkPassword(event, "password")
            }
            }
          />

          <label htmlFor="retype_password">Re-type new password </label> 
          
          <input
            type="password"
            id="retype_password"
            name="retype_password"
            value={userData.retype_password}
            onChange={(event) =>
              {setRetypePassword(event.target.value)
              checkPassword(event, "retype_password")}
            }
          />
          {!passwdMatch && password !== '' ? (
            <><small style={{ color: 'red' }}>password does not match </small></>
          ) : (
            <></>
          )} 
          {!passwdMatch || username === '' || password === '' ? (<></>) : (<button type="submit">Change password</button>) }

        </form>
      </div>
      }
      {!masterToken && <div className="login">
        <form>
          {!loading && showCam && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
                <form>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(event) =>{setUsername(event.target.value)}
                    }
                    />
                </form>
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
            <button type="submit" onClick={handleSubmit}>Submit Face</button>
          }
          { retryButton && 
            <button type="submit" onClick={handleRetry}>Retry</button>
          }
        </form>
      </div>}
      <style jsx>{`
        .signup {
            max-width: 340px;
            margin: 0 auto;
            padding: 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            }
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
        headerx {
            display: flex;
            flex-direction: column;
            align-items: center;
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
