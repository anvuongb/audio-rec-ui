import Image from 'next/image'
import styles from './layout.module.css'
import Link from 'next/link'
import utilStyles from '../styles/utils.module.css'
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from 'react'
import countryList from 'react-select-country-list'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import {urlBase, maxVoiceLength} from '../constant/url'
import {useRouter} from 'next/router'
import Select from 'react-select'

const ReactMic = dynamic(
  () => {
    return import('@cleandersonlobo/react-mic').then((mod) => mod.ReactMic);
  },
  { ssr: false }
);


export default function VoiceRecording(props) {
    const router = useRouter()

    const [requestId, setRequestId] = useState("");
    const [fileId, setFileId] = useState("");
    const [generatedText, setGeneratedText] = useState("");

    const [mediaBlob, setMediaBlob] = useState(null);
    const [mediaBlobUrl, setMediaBlobUrl] = useState(null);
    const [status, setStatus] = useState(null);
    const [isRecord, setIsRecord] = useState(false);
    
    const [errorVoice, setErrorVoice] = useState("");
    
    const [showVoice, setShowVoice] = useState(false);
    const [loadingSubmitVoice, setLoadingSubmitVoice] = useState(false);
    const [retryButtonSubmitVoice, setRetryButtonSubmitVoice] = useState(false);

    const [firstVoiceComplete, setFirstVoiceComplete] = useState(false);
    const [secondVoiceComplete, setSecondVoiceComplete] = useState(false);

    const [audioLengthAccept, setAudioLengthAccept] = useState(true);

    // country selector
    const [valueCountry, setValueCountry] = useState('')
    const optionsCountry = useMemo(() => countryList().setLabel('TW', 'Taiwan').getData(), [])
    const countryChangeHandler = value => {
      setValueCountry(value)
    }

    // gender selector
    const [valueGender, setValueGender] = useState('')
    const optionGender = [{
      label: "Male",
      value: "Male",
    },
    {
      label: "Female",
      value: "Female",
    }
  ]
    const genderChangeHandler = value => {
      setValueGender(value)
    }

    // mask selector
    const [valueMask, setValueMask] = useState('')
    const optionsMask = [{
      label: "KN95",
      value: "KN95",
    },
    {
      label: "Cloth",
      value: "Cloth",
    },
    {
      label: "Surgical",
      value: "Surgical",
    },
    {
      label: "Other (Please specify)",
      value: "Other",
    }
  ]
    const maskChangeHandler = value => {
      setValueMask(value)
    }
    // manual mask selector
    const [valueMaskManual, setValueMaskManual] = useState('')
    const maskManualChangeHandler = event => {
      setValueMaskManual(event.target.value)
    }

    function clearState() {
        setErrorVoice("");
        setRequestId("");
        setShowVoice(!showVoice);
        stopRecording();
        clearBlobUrl();
        setMediaBlob(null);
        setMediaBlobUrl(null);
        setLoadingSubmitVoice(false);
        setRetryButtonSubmitVoice(false);
        setFirstVoiceComplete(false);
        setSecondVoiceComplete(false);
    }
    useEffect(() => {
        clearState();
        initMetadata();
      }, []);

    const initMetadata = async() => {
        try {
          const request_id = uuidv4();
          setRequestId(request_id);  
          const response = await axios.get(
            urlBase + '/api/initMetadata',
            {
              headers: {
                'Content-Type': 'application/json'
              },
              params: {
                request_id: request_id,
              }
            }
          );
            const file_id = response.data.file_id
            const result_code = response.data.result_code
            const result_message = response.data.result_message
            const generated_text = response.data.generated_text

            if (result_code !== 1) {
                console.log(result_message)
                router.push('/');
            }

            setFileId(file_id);
            setGeneratedText(generated_text);
        }
        catch (error) {
          console.error(error)
          router.push('/');
        }
      }
    
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

        const formData = new FormData();
        formData.append("file", mediaBlob);
        formData.append("request_id", requestId);
        formData.append("file_id", fileId);
        formData.append("generated_text", generatedText);
        formData.append("sound_rate", 44100);
        formData.append("masked", 1);
        formData.append("gender", valueGender.value);
        formData.append("country", valueCountry.label);
        if (valueMask.value === "Other") {
          formData.append("mask_type", valueMaskManual);
        } else {
          formData.append("mask_type", valueMask.value);
        }

        try {
            const response = await axios.post( 
            urlBase + '/api/saveAudio', formData, 
            {
                headers: {
                'Content-Type': "multipart/form-data"
                },
                params: {
                }
            }
            );

            if (response.status !== 200) {
                throw new Error(response.statusText)
            } 
            const r = response.data
            const result_code = r.result_code
            const result_message = r.result_message
            
            if (result_code) {
                setFirstVoiceComplete(true);
                setShowVoice(true);
                stopRecording();
                clearBlobUrl();
                setErrorVoice("");
            } 
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

        const formData = new FormData();
        formData.append("file", mediaBlob);
        formData.append("request_id", requestId);
        formData.append("file_id", fileId);
        formData.append("generated_text", generatedText);
        formData.append("sound_rate", 44100);
        formData.append("masked", 0);

        try {
            const response = await axios.post( 
            urlBase + '/api/saveAudio', formData, 
            {
                headers: {
                'Content-Type': "multipart/form-data"
                },
                params: {
                }
            }
            );

            if (response.status !== 200) {
            throw new Error(response.statusText)
            } 
            const r = response.data
            const result_code = r.result_code
            const result_message = r.result_message
            if (result_code) {
                setSecondVoiceComplete(true);
                setShowVoice(true);
                stopRecording();
                clearBlobUrl();
                setErrorVoice("");
            } 
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
    {(showVoice || loadingSubmitVoice || errorVoice ) &&
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
              {firstVoiceComplete && !secondVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <b>Step: &nbsp;</b> 2
              </div>}
              {secondVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <b>Done &nbsp;</b> 
              </div>}
              {!loadingSubmitVoice && showVoice && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              
              {!firstVoiceComplete && <div>Record the following sentence&nbsp;<b>with</b>&nbsp;mask</div>}
              
              {firstVoiceComplete && !secondVoiceComplete && <div>Record the following sentence&nbsp;<b>without</b>&nbsp;mask</div>}
              {secondVoiceComplete && <div>
              Thank you for your participation.
              Your recording ID is&nbsp;<b>{fileId}</b>, contact us with this ID if you want your record removed.
              </div>}
              </div>}
              {secondVoiceComplete && <div className={styles.backToHome}>
                  <a onClick={() => {window.location.href="/"}}>← Do it again?</a>
                </div>}
              {!firstVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}><small><i><br />If you are not comfortable sharing the following information, <br />feel free to leave them unselected</i></small></div>}
              {!firstVoiceComplete && <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <Select options={optionsCountry} value={valueCountry} onChange={countryChangeHandler} placeholder='Select Country'/>
              <Select options={optionGender} value={valueGender} onChange={genderChangeHandler} placeholder='Select Gender'/>
              <Select options={optionsMask} value={valueMask} onChange={maskChangeHandler} placeholder='Mask type'/>
              </div>}
              {valueMask.value==="Other" && !firstVoiceComplete &&
                <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                  <form>
                    <label htmlFor="mask">Mask type:&nbsp; &nbsp; </label>
                    <input
                      type="text"
                      id="mask"
                      name="mask"
                      value={valueMaskManual}
                      onChange={maskManualChangeHandler}
                      style={{
                        height:"40px",
                        width:"300px",
                        fontSize:"20px",
                      }}
                    />
                  </form>
                </div>}
              {!loadingSubmitVoice && showVoice &&<div style={{
                    display:"flex",
                    justifyContent:"center",
                }}>
                {!firstVoiceComplete && <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;{generatedText}&nbsp;&nbsp;</h2>}
                {firstVoiceComplete && !secondVoiceComplete && <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;{generatedText}&nbsp;&nbsp;</h2>}
              </div>}
              <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                {status!=="recording" && !mediaBlobUrl && !secondVoiceComplete && <button onClick={startRecording}>Start Recording</button>}
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
                  Saving your voice ...
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
          max-width: 700px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }

        a:hover {
          cursor:pointer;
         }
      `}</style>
    </>
  )
}
