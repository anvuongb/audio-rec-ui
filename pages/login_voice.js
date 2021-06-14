import { useState, useEffect } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image'
import { v4 as uuidv4 } from 'uuid';
import urlBase from '../constant/url'
import axios from 'axios'
import Head from 'next/head'


import dynamic from "next/dynamic";

const ReactMic = dynamic(
    () => {
      return import('@cleandersonlobo/react-mic').then((mod) => mod.ReactMic);
    },
    { ssr: false }
  );

function Login() {
  const router = useRouter() 

  const [loading, setLoading] = useState(false);
  const [retryButton, setRetryButton] = useState(false);
  const [showVoice, setShowVoice] = useState(true);
  const [voiceToken, setVoiceToken] = useState("");
  const [voiceGeneratedText, setVoiceGeneratedText] = useState("");

  const [userData, setUserData] = useState({
    error: '',
  })

  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
  const [status, setStatus] = useState(null);
  const [isRecord, setIsRecord] = useState(false);

  function startRecording() {
    setStatus("recording");
    setIsRecord(true);
  }
 
  function stopRecording() {
    setStatus(null);
    setIsRecord(false);
  }
 
  function onData(recordedBlob) {
    // console.log('chunk of real-time data is: ', recordedBlob);
  }
 
  function onStop(recordedBlob) {
    // console.log('recordedBlob is: ', recordedBlob);
    setMediaBlob(recordedBlob.blob)
    setMediaBlobUrl(recordedBlob.blobURL);
  }
  function clearBlobUrl() {
    setMediaBlob(null);
    setMediaBlobUrl(null);
  }

  function handleRetry() {
    setUserData({ ...userData, error: '' })
    setShowVoice(true);
    stopRecording();
    clearBlobUrl();
    setMediaBlob(null);
    setLoading(false);
    setRetryButton(false);
    getVoiceToken();

  }

  useEffect(() => {
    getVoiceToken();
  }, []);

  async function getVoiceToken() {
    const username = router.query.user
    const token = router.query.token
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
          setUserData({ ...userData, error: result_message + " code " + result_code })
        }
      } catch (error) {
        console.error(error)
        setUserData({ ...userData, error: error.message })
      }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })
    setLoading(true);
    setShowVoice(false);

    const username = router.query.user
    const token = router.query.token

    const formData = new FormData();
    formData.append("file", mediaBlob);
    formData.append("request_id", uuidv4());
    formData.append("username", username);
    formData.append("voice_generated_text", voiceGeneratedText)
    // formData.append("sound_rate", 44100)

    // console.log(formData)


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
        router.push('/login_success?next_step=done&user='+username+'&token='+newToken)
      } else if (result_message === 'token invalid') {
        router.push('/login_fail')
      } else {
        setRetryButton(true);
        switch(result_code) {
          case -8:
            setUserData({ ...userData, error: "voice MFA is not activated" })
            break;
          case -7:
            setUserData({ ...userData, error: "voice quality not accepted, recorded text and generated text do not match" })
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
        <title>Voice Login page</title>
      </Head>
      <div className="login">
        <form>
        {showVoice && !loading && 
          <div style={{visibility: 'hidden', height: 1, width:    1 }}>
            <ReactMic
              record={isRecord}
              className=""
              onStop={onStop}
              onData={onData}
              strokeColor="#000000"
              mimeType="audio/wav"
            />
          </div>
          }
          <div>
            {!loading && showVoice &&<div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;{voiceGeneratedText}&nbsp;&nbsp;</h2>
            </div>}
            {!loading && showVoice && !mediaBlob && status !== "recording" &&
            
             (<><div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                  
                <Image
                  className="refresh"
                  onClick={getVoiceToken}
                  onHo
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
              {mediaBlobUrl && !loading && status!=="recording" && <audio src={mediaBlobUrl} controls/>}
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
              {userData.error && <p className="error">Error: {userData.error}</p>}
              <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                {retryButton && <button onClick={handleRetry}>Retry</button>}
                {(!loading && showVoice && status==="recording") && <button onClick={stopRecording}>Stop Recording</button>}
                {(!loading && showVoice && mediaBlobUrl && status!=="recording") && <button onClick={handleSubmit}>Submit Voice</button> }
                {(!loading && showVoice && mediaBlobUrl && status!=="recording") && <button onClick={handleRetry}>Re-record</button> }
              </div>
              {loading ? (<>
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

        image { 
          cursor: pointer; 
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
