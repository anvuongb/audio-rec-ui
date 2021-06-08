import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'
import {useRouter} from 'next/router'
import Webcam from "react-webcam";

export default function EnableFaceMFA(props) {
    const router = useRouter()

    const webcamRef = useRef(null);
    const [showCam, setShowCam] = useState(false);
    const [loadingSubmitFace, setLoadingSubmitFace] = useState(false);
    const [retryButtonSubmitFace, setRetryButtonSubmitFace] = useState(false);
    const [errorFace, setErrorFace] = useState("");
    const [imgSrc, setImgSrc] = useState(null);

    function clearState() {
        setShowCam(!showCam);
        setRetryButtonSubmitFace(false);
        setErrorFace("");
        setImgSrc(null);
        setLoadingSubmitFace(false);
    }
    useEffect(() => {
        if (!props.username || !props.token) {
            return;
          }
        clearState();
      }, [props.username, props.token]);

    function handleRetrySubmitFace() {
        setLoadingSubmitFace(false);
        setShowCam(true);
        setRetryButtonSubmitFace(false);
        setErrorFace("");
        setImgSrc(null);
      }

    async function handleSubmitFace(event) {
        event.preventDefault()
        setErrorFace("")
        setLoadingSubmitFace(true);
        setShowCam(false);
    
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
        
        const imageBase64 = imageSrc.split(";base64,")[1]
    
        const username = props.username
        const token = props.token
    
        try {
          const response = await fetch(urlBase + '/api/create/face', {
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
          const accepted = r.accepted
          if (accepted) {
            router.push('/mfa_success?op=add')
          } else if (result_message === 'token invalid') {
            router.push('/login_fail') }
          else {
            setErrorFace( result_message + " code " + result_code )
            setRetryButtonSubmitFace(true);
          }
        } catch (error) {
          console.error(error)
          setErrorFace(error.message )
          setRetryButtonSubmitFace(true);
        }
        setLoadingSubmitFace(false)
      }

  return (
      <>
        {(showCam || loadingSubmitFace || errorFace) &&
        <div className="face">
        <form>
        {!loadingSubmitFace && showCam && <div style={{
                    display:"flex",
                    justifyContent:"center",
                }}>
                <b>{props.username}</b>, take a photo to create face-based MFA
                </div>}
        {showCam && <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
        />}
        {showCam && <button type="submit" onClick={handleSubmitFace}>Submit Face</button>}
        {loadingSubmitFace ? (<>
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
        {!loadingSubmitFace && imgSrc && (
                <img
                src={imgSrc}
                />
            )}
        {errorFace && <p className="error">Error: {errorFace}</p>}
        { retryButtonSubmitFace && 
                <button type="submit" onClick={handleRetrySubmitFace}>Retry</button>
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
