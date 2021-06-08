import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'
import {useRouter} from 'next/router'
import Webcam from "react-webcam";

export default function RemoveFaceMFA(props) {
    const router = useRouter()

    const webcamRef = useRef(null);
    const [showCamRemoveFaceMFA, setShowCamRemoveFaceMFA] = useState(false);
    const [errorFaceLogin, setErrorFaceLogin] = useState("");
    const [loadingRemoveFaceMFA, setLoadingRemoveFaceMFA] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);
    const [retryButtonLoginFace, setRetryButtonLoginFace] = useState(false);

    function clearState() {
        setShowCamRemoveFaceMFA(!showCamRemoveFaceMFA);
        setLoadingRemoveFaceMFA(false);
        setRetryButtonLoginFace(false);
        setErrorFaceLogin("");
        setImgSrc(null);
    }
    useEffect(() => {
        if (!props.username || !props.token) {
            return;
          }
        clearState();
      }, [props.username, props.token]);

    function handleRetryRemoveFaceMFA() {
        setLoadingRemoveFaceMFA(false);
        setShowCamRemoveFaceMFA(true);
        setRetryButtonLoginFace(false);
        setErrorFaceLogin("");
        setImgSrc(null);
      }

    async function handleLoginFaceRemoveMFA(event) {
        event.preventDefault()
        setErrorFaceLogin("");
        setLoadingRemoveFaceMFA(true);
        setShowCamRemoveFaceMFA(false);
    
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        
        const imageBase64 = imageSrc.split(";base64,")[1]
    
        const username = props.username
        const token = props.token
    
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
            try {
              const responseRemove = await axios.get(
                urlBase + '/api/mfa/remove/face',
                {
                  headers: {
                    'Content-Type': 'application/json', 'Authorization': 'Bearer ' + newToken 
                  },
                  params: {
                    request_id: uuidv4(),
                    username: username
                  }
                }
              );
              const result_code_r = responseRemove.data.result_code
              const result_message_r = responseRemove.data.result_message
              if (result_code_r === 1) {
                router.push('/mfa_success?op=remove')
              }
              else {
                setErrorFaceLogin(result_message_r + " code " + result_code_r )
                setRetryButtonLoginFace(true);
              }
            }
            catch(error) {
              console.error(error)
              setErrorFaceLogin( error.message )
              setRetryButtonLoginFace(true);
            }
          } else if (result_message === 'token invalid') {
            router.push('/login_fail')
          } else {
            setErrorFaceLogin( result_message + " code " + result_code )
            setRetryButtonLoginFace(true);
          }
        } catch (error) {
          console.error(error)
          setErrorFaceLogin(error.message)
          setRetryButtonLoginFace(true);
        }
        setLoadingRemoveFaceMFA(false)
      }

  return (
      <>
        {(showCamRemoveFaceMFA || loadingRemoveFaceMFA || errorFaceLogin) &&
        <div className="face">
            <form>
                {!loadingRemoveFaceMFA && showCamRemoveFaceMFA && <div style={{
                            display:"flex",
                            justifyContent:"center",
                        }}>
                        <b>{props.username}</b>, verify your face to remove MFA
                        </div>}
                {showCamRemoveFaceMFA && <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                />}
                {showCamRemoveFaceMFA && <button type="submit" onClick={handleLoginFaceRemoveMFA}>Submit Face</button>}
                {loadingRemoveFaceMFA ? (<>
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
                {!loadingRemoveFaceMFA && imgSrc && (
                        <img
                        src={imgSrc}
                        />
                    )}
                {errorFaceLogin && <p className="error">Error: {errorFaceLogin}</p>}
                { retryButtonLoginFace && 
                        <button type="submit" onClick={handleRetryRemoveFaceMFA}>Retry</button>
                    }
            </form>
        </div>}
        <style jsx>{`
        
        .face {
          max-width: 550px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        form {
          display: flex;
          flex-flow: column;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </>
  )
}
