import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import {urlBase, maxVoiceLength} from '../constant/url'
import {useRouter} from 'next/router'

const ReactMic = dynamic(
  () => {
    return import('@cleandersonlobo/react-mic').then((mod) => mod.ReactMic);
  },
  { ssr: false }
);


export default function EnableVoiceMFAV2(props) {
    const router = useRouter()

    const [mediaBlob, setMediaBlob] = useState(null);
    const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
    const [status, setStatus] = useState(null);
    const [isRecord, setIsRecord] = useState(false);
    
    const [errorVoice, setErrorVoice] = useState("");
    
    const [showVoice, setShowVoice] = useState(false);
    const [loadingSubmitVoice, setLoadingSubmitVoice] = useState(false);
    const [retryButtonSubmitVoice, setRetryButtonSubmitVoice] = useState(false);

    const [firstVoiceComplete, setFirstVoiceComplete] = useState(false);

    const [audioLengthAccept, setAudioLengthAccept] = useState(true);

    function clearState() {
        setErrorVoice("");
        setShowVoice(!showVoice);
        stopRecording();
        clearBlobUrl();
        setMediaBlob(null);
        setMediaBlobUrl(null);
        setLoadingSubmitVoice(false);
        setRetryButtonSubmitVoice(false);
        setFirstVoiceComplete(false);
    }
    useEffect(() => {
        if (!props.username || !props.token) {
            return;
          }
        clearState();
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
        // console.log('chunk of real-time data is: ', recordedBlob);
      }
     
    function onStop(recordedBlob) {
        // console.log('recordedBlob is: ', recordedBlob);
        setMediaBlob(recordedBlob.blob)
        setMediaBlobUrl(recordedBlob.blobURL);
        if ((recordedBlob.stopTime - recordedBlob.startTime)/1000 > maxVoiceLength) {
          setErrorVoice( `audio file too long ${(recordedBlob.stopTime - recordedBlob.startTime)/1000}s, maximum allowed ${maxVoiceLength}s` )
          setAudioLengthAccept(false);
        }
      }
    function clearBlobUrl() {
        setMediaBlob(null);
        setMediaBlobUrl(null);
      }

    function handleRetrySubmitVoice() {
        setErrorVoice("");
        setAudioLengthAccept(true);
        setShowVoice(true);
        stopRecording();
        clearBlobUrl();
        setMediaBlob(null);
        setLoadingSubmitVoice(false);
        setRetryButtonSubmitVoice(false);
      }

    async function handleSubmitVoiceFirst(event) {
        event.preventDefault();
        setErrorVoice("")
        setLoadingSubmitVoice(true);
        setShowVoice(false);

        const username = props.username
        const token = props.token

        const formData = new FormData();
        formData.append("file", mediaBlob);
        formData.append("request_id", uuidv4());
        formData.append("username", username);
        // formData.append("sound_rate", 44100)

        try {
            const response = await axios.post( 
            urlBase + '/api/create/voice/first', formData, 
            {
                headers: {
                'Content-Type': "multipart/form-data", 'Authorization': 'Bearer ' + token 
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
            const accepted = r.accepted
            if (accepted) {
                setFirstVoiceComplete(true);
                setShowVoice(true);
                stopRecording();
                clearBlobUrl();
                setErrorVoice("");
            } else if (result_message === 'token invalid') {
                setFirstVoiceComplete(false);
                router.push('/login_fail') }
            else {
                setErrorVoice(result_message + " code " + result_code )
                setFirstVoiceComplete(false);
                setRetryButtonSubmitVoice(true);
            }
        } catch (error) {
            console.error(error)
            setErrorVoice(error.message )
            setFirstVoiceComplete(false);
            setRetryButtonSubmitVoice(true);
        }
        setLoadingSubmitVoice(false)
    }

    async function handleSubmitVoiceSecond(event) {
        event.preventDefault();
        setErrorVoice("")
        setLoadingSubmitVoice(true);
        setShowVoice(false);

        const username = props.username
        const token = props.token

        const formData = new FormData();
        formData.append("file", mediaBlob);
        formData.append("request_id", uuidv4());
        formData.append("username", username);
        // formData.append("sound_rate", 44100)

        try {
            const response = await axios.post( 
            urlBase + '/api/create/voice/second', formData, 
            {
                headers: {
                'Content-Type': "multipart/form-data", 'Authorization': 'Bearer ' + token 
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
            const accepted = r.accepted
            if (accepted) {
                router.push('/mfa_success?op=add')
            } else if (result_message === 'token invalid') {
                router.push('/login_fail') }
            else {
                setErrorVoice(result_message + " code " + result_code )
                setRetryButtonSubmitVoice(true);
            }
        } catch (error) {
            console.error(error)
            setErrorVoice(error.message )
            setRetryButtonSubmitVoice(true);
        }
        setLoadingSubmitVoice(false)
    }
    

  return (
      <>
    {(showVoice || loadingSubmitVoice || errorVoice) &&
        <div className="face">
            {showVoice && !loadingSubmitVoice && 
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
             {!firstVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <b>Step: &nbsp;</b> 1
              </div>}
              {firstVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <b>Step: &nbsp;</b> 2
              </div>}
              {!loadingSubmitVoice && showVoice && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <b>{props.username}</b>, record the following text to create voice-based MFA
              </div>}
              {!loadingSubmitVoice && showVoice &&<div style={{
                    display:"flex",
                    justifyContent:"center",
                }}>
                {!firstVoiceComplete && <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;đây là giọng nói của tôi&nbsp;&nbsp;</h2>}
                {firstVoiceComplete && <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;tôi đã đọc và đồng ý&nbsp;&nbsp;</h2>}
              </div>}
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
                {mediaBlobUrl && !loadingSubmitVoice && status!=="recording" && <audio src={mediaBlobUrl} controls/>}
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
                {errorVoice && <p className="error">Error: {errorVoice}</p>}
                <div style={{
                    display:"flex",
                    justifyContent:"center",
                }}>
                  {(retryButtonSubmitVoice || !audioLengthAccept) && <button onClick={handleRetrySubmitVoice}>Retry</button>}
                  {(!loadingSubmitVoice && audioLengthAccept && showVoice && status==="recording") && <button onClick={stopRecording}>Stop Recording</button>}
                  {(!loadingSubmitVoice && audioLengthAccept && showVoice && mediaBlobUrl && status!=="recording") && !firstVoiceComplete &&
                        <button onClick={handleSubmitVoiceFirst}>Submit Voice</button> }
                  {(!loadingSubmitVoice && audioLengthAccept && showVoice && mediaBlobUrl && status!=="recording") && firstVoiceComplete &&
                        <button onClick={handleSubmitVoiceSecond}>Submit Voice</button> }
                  {(!loadingSubmitVoice && audioLengthAccept && showVoice && mediaBlobUrl && status!=="recording") && <button onClick={handleRetrySubmitVoice}>Re-record</button> }
                </div>
                {loadingSubmitVoice ? (<>
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

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </>
  )
}
