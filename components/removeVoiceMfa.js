import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'
import {useRouter} from 'next/router'

const ReactMic = dynamic(
  () => {
    return import('@cleandersonlobo/react-mic').then((mod) => mod.ReactMic);
  },
  { ssr: false }
);


export default function RemoveVoiceMFA(props) {
    const router = useRouter()
    
    const [mediaBlob, setMediaBlob] = useState(null);
    const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
    const [status, setStatus] = useState(null);
    const [isRecord, setIsRecord] = useState(false);

    const [errorVoiceLogin, setErrorVoiceLogin] = useState("");
    
    const [showVoiceRemoveVoiceMFA, setShowVoiceRemoveVoiceMFA] = useState(false);
    const [loadingRemoveVoiceMFA, setLoadingRemoveVoiceMFA] = useState(false);
    const [retryButtonLoginVoice, setRetryButtonLoginVoice] = useState(false);
    const [voiceToken, setVoiceToken] = useState("");
    const [voiceGeneratedText, setVoiceGeneratedText] = useState("");

    function clearState() {
        setErrorVoiceLogin("");
        setShowVoiceRemoveVoiceMFA(!showVoiceRemoveVoiceMFA);
        stopRecording();
        clearBlobUrl();
        setMediaBlob(null);
        setMediaBlobUrl(null);
        setStatus(null);
        setIsRecord(false);
        setLoadingRemoveVoiceMFA(false);
        setRetryButtonLoginVoice(false);
        setVoiceGeneratedText("");
    }
    useEffect(() => {
        if (!props.username || !props.token) {
            return;
          }
        clearState();
        getVoiceToken();
      }, [props.username, props.token]);
    
    function startRecording() {
        setStatus("recording");
        setIsRecord(true);
      }
     
    function stopRecording() {
        setStatus(null);
        setIsRecord(false);
      }
     
    function onData(recordedBlob) {
        console.log('chunk of real-time data is: ', recordedBlob);
      }
     
    function onStop(recordedBlob) {
        console.log('recordedBlob is: ', recordedBlob);
        setMediaBlob(recordedBlob.blob)
        setMediaBlobUrl(recordedBlob.blobURL);
      }
    function clearBlobUrl() {
        setMediaBlob(null);
        setMediaBlobUrl(null);
      }
    
    async function getVoiceToken() {
        const username = props.username
        const token = props.token

        try {
            const response = await fetch(urlBase + '/api/voice/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token},
              body: JSON.stringify({"request_id":uuidv4(), "user_name":username}),
            })
      
            if (response.status !== 200) {
              throw new Error(await response.text())
            }
            const r = await response.json()
            const result_code = r.result_code
            const result_message = r.result_message
            const voice_token = r.token
            const voice_generated_text = r.voice_generated_text
            if (result_code === 1) {
                setVoiceToken(voice_token);
                setVoiceGeneratedText(voice_generated_text)
            } else {
              setError(result_message + " code " + result_code )
            }
          } catch (error) {
            console.error(error)
            setError(error.message)
          }
      }

    function handleRetryRemoveVoiceMFA() {
        //clear state
        setErrorVoiceLogin("");
        setVoiceToken("")
        setShowVoiceRemoveVoiceMFA(true);
        setLoadingRemoveVoiceMFA(false);
        stopRecording();
        clearBlobUrl();
        setRetryButtonLoginVoice(false);
    
        // get voice token
        getVoiceToken();
      }

    async function handleLoginVoiceRemoveMFA(event) {
        event.preventDefault()
        setErrorVoiceLogin("")
        setLoadingRemoveVoiceMFA(true);
        setShowVoiceRemoveVoiceMFA(false);
    
        const username = props.username
        const token = props.token
    
        const formData = new FormData();
        formData.append("file", mediaBlob);
        formData.append("request_id", uuidv4());
        formData.append("username", username);
        formData.append("voice_generated_text", voiceGeneratedText)
    
        try {
          const response = await axios.post( 
            urlBase + '/api/login/voice', formData, 
            {
              headers: {
                'Content-Type': "multipart/form-data", 'Authorization': 'Bearer ' + token , 'Authorization-Voice': 'Bearer ' + voiceToken,
              },
              params: {
                request_id: uuidv4(),
                username: username,
                sound_rate: 44100
              }
            }
          );
    
          if (response.status !== 200) {
            throw new Error(response.statusText)
          } 
          const r = response.data
          const result_code = r.result_code
          const result_message = r.result_message
          const next_step = r.next_step
          const newToken = r.token
          if (result_code === 1 && next_step === "done") {
            try {
              const responseRemove = await axios.get(
                urlBase + '/api/mfa/remove/voice',
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
                setErrorVoiceLogin(result_message_r + " code " + result_code_r )
                setRetryButtonLoginVoice(true);
              }
            }
            catch(error) {
              console.error(error)
              setErrorVoiceLogin(error.message)
              setRetryButtonLoginVoice(true);
            }
          } else if (result_message === 'token invalid') {
            router.push('/login_fail')
          } else {
            setErrorVoiceLogin(result_message + " code " + result_code )
            setRetryButtonLoginVoice(true);
          }
        } catch (error) {
          console.error(error)
          setErrorVoiceLogin(error.message )
          setRetryButtonLoginVoice(true);
        }
        setLoadingRemoveVoiceMFA(false)
      }
    

  return (
      <>
    {(showVoiceRemoveVoiceMFA || loadingRemoveVoiceMFA || errorVoiceLogin) &&
    <div className="face">
     <form>
      {!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{props.username}</b>, verify your voice to remove MFA
            </div>}
      {!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && <div style={{visibility: 'hidden', height: 1, width:    1 }}>
            <ReactMic
              record={isRecord}
              className=""
              onStop={onStop}
              onData={onData}
              strokeColor="#000000"
              mimeType="audio/wav"
            />
          </div>}
      <div>
      {!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA &&<div style={{
            display:"flex",
            justifyContent:"center",
        }}>
        <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;{voiceGeneratedText}&nbsp;&nbsp;</h2>
      </div>}
      {!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && !mediaBlob && status !== "recording" &&
      
        (<><div style={{
            display:"flex",
            justifyContent:"center",
        }}>
            
          <Image
            className="refresh"
            onClick={getVoiceToken}
            priority
            src="/images/refresh.png"
            className={utilStyles.borderCircle}
            height={30}
            width={30}
            />
        </div><br/></>)
        
      }
      
      <div style={{
          display:"flex",
          justifyContent:"center",
      }}>
        {status!=="recording" && !mediaBlobUrl && <button onClick={startRecording}>Start Recording</button>}
      </div>
      <div style={{
            display:"flex",
            justifyContent:"center",
        }}>
        {mediaBlobUrl && !loadingRemoveVoiceMFA && status!=="recording" && <audio src={mediaBlobUrl} controls/>}
      </div>
      {status==="recording" && 
        <div style={{
            display:"flex",
            justifyContent:"center",
        }}>
            
          <Image
            priority
            src="/images/recording.gif"
            className={utilStyles.borderCircle}
            height={37}
            width={49}
            />
        </div>}
        <br/>
        {errorVoiceLogin && <p className="error">Error: {errorVoiceLogin}</p>}
        <div style={{
            display:"flex",
            justifyContent:"center",
        }}>
          {retryButtonLoginVoice && <button onClick={handleRetryRemoveVoiceMFA}>Retry</button>}
          {(!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && status==="recording") && <button onClick={stopRecording}>Stop Recording</button>}
          {(!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && mediaBlobUrl && status!=="recording") && <button onClick={handleLoginVoiceRemoveMFA}>Submit Voice</button> }
          {(!loadingRemoveVoiceMFA && showVoiceRemoveVoiceMFA && mediaBlobUrl && status!=="recording") && <button onClick={handleRetryRemoveVoiceMFA}>Re-record</button> }
        </div>
        {loadingRemoveVoiceMFA ? (<>
          <div style={{
              display:"flex",
              justifyContent:"center",
          }}>
          Calculating voice attributes ...
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
        
    </div>
    </form>
    </div>
    }
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
