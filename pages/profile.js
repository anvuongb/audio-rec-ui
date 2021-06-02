import { useState, useEffect, useRef } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import Webcam from "react-webcam";
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image'
import Popup from 'reactjs-popup';
import urlBase from '../constant/url'

import { useReactMediaRecorder } from "react-media-recorder";

function Profile() {
  const router = useRouter()
  const [data, setData] = useState(null);
  const webcamRef = useRef(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ video: false });

  const [loading, setLoading] = useState(false);
  const [loadingMFA, setLoadingMFA] = useState(false);
  const [loadingRemoveMFA, setLoadingRemoveMFA] = useState(false);
  const [dataFilter, setDataFilter] = useState(null);
  const [mfaMethod, setMfaMethod] = useState(null);
  const [showCam, setShowCam] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showCamRemoveFaceMFA, setShowCamRemoveFaceMFA] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [retryButtonSubmitFace, setRetryButtonSubmitFace] = useState(false);
  const [retryButtonLoginFace, setRetryButtonLoginFace] = useState(false);

  const [showMFA, setShowMFA] = useState(false);
  const [faceMFAData, setFaceMFAData] = useState(null);
  const [showFacePopup, setShowFacePopup] = useState(false);
  const [showFacePopupData, setShowFacePopupData] = useState(null);
  const [loadingPopupFace, setLoadingPopupFace] = useState(false);

  const username = router.query.user;
  const token = router.query.token;

  const [userData, setUserData] = useState({
    error: '',
    errorMfa: '',
    errorFace: '',
    errorFaceLogin: '',
    errorMfaRecord: '',
    errorFacePopup: '',
  })
  const fetchData = async() => {
    try {
      const response = await axios.get(
        urlBase + '/api/history/login/records',
        {
          headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token 
          },
          params: {
            request_id: uuidv4(),
            username: username
          }
        }
      );
        const dataF = response.data.map((d) => Object.assign({}, ...
            Object.entries(d).filter(([k,v]) => k==='login_method' || k==='result_message' || k==='login_at' ||k==='face_id').map(([k,v]) => ({[k]:v}))
        ))
        setData(response.data)
        setDataFilter(dataF)
    }
    catch (error) {
      console.error(error)
      setData(null);
      setUserData({ ...userData, errorMfa: error.message });
      router.push('/login_fail');
    }
  }

  const fetchMfaMethod = async() => {
    try {
      const response = await axios.get(
        urlBase + '/api/history/login/mfa',
        {
          headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token 
          },
          params: {
            request_id: uuidv4(),
            username: username
          }
        }
      );
        const d = response.data.mfa_method
        setMfaMethod(d)
    }
    catch (error) {
      console.error(error)
      setMfaMethod(null);
      setUserData({ ...userData, error: error.message });
      router.push('/login_fail');
    }
  }

  useEffect(() => {
    if (!username || !token) {
      return;
    }
    fetchData();
    fetchMfaMethod();

  }, [username, token]);

  const closeFacePopup = () => {
    setShowFacePopup(false);
    setShowFacePopupData(null);
    setLoadingPopupFace(false);
  }

  async function handleShowFacePopup(faceId) {
    setShowFacePopup(true);
    setLoadingPopupFace(true);

    const username = router.query.user
    const token = router.query.token

    try {
      const response = await axios.get(
        urlBase + '/api/history/face/image',
        {
          headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token 
          },
          params: {
            request_id: uuidv4(),
            face_id: faceId,
            username: username,
          }
        }
      );

      setShowFacePopupData(response.data)
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, errorFacePopup: error.message })
    }
    setLoadingPopupFace(false);
  }

  function handleEnableVoiceMfa(event) {
    event.preventDefault()
    if (showVoice) {
      setUserData({ ...userData, errorVoice: '' })
      clearBlobUrl();
    }
    setShowVoice(!showVoice);

    // disable face mfa
    setUserData({ ...userData, errorFace: '' })
    setShowCam(false);
    setLoading(false);
    setImgSrc(null);
    setRetryButtonSubmitFace(false);
  } 

  function handleEnableFaceMfa(event) {
    event.preventDefault()
    if (showCam) {
      setUserData({ ...userData, errorFace: '' })
    }
    setShowCam(!showCam);
    setLoading(false);
    setImgSrc(null);
    setRetryButtonSubmitFace(false);

    // disable voice mfa
    setUserData({ ...userData, errorVoice: '' })
    clearBlobUrl();
    setShowVoice(false);

  }

  function handleRetrySubmitFace() {
    setLoading(false);
    setShowCam(true);
    setRetryButtonSubmitFace(false);
    setUserData({ ...userData, errorFace: "" })
  }

  async function handleRemoveFaceMFA(event) {
    event.preventDefault()
    if (showCamRemoveFaceMFA) {
      setUserData({ ...userData, errorFaceLogin: '' })
    }
    setShowCamRemoveFaceMFA(!showCamRemoveFaceMFA);
    setLoadingRemoveMFA(false);
    setImgSrc(null);
    setRetryButtonLoginFace(false);

    // clear view MFA
    setShowMFA(false);
    setLoadingMFA(false);
    setFaceMFAData(null);
    setUserData({ ...userData, errorMfaRecord: "" })
  }

  function handleRetryRemoveFaceMF() {
    setLoadingRemoveMFA(false);
    setShowCamRemoveFaceMFA(true);
    setRetryButtonLoginFace(false);
    setUserData({ ...userData, errorFaceLogin: "" })
  }

  async function handleViewFaceMFA(event) {
    event.preventDefault()
    setShowMFA(!showMFA)
    setShowCam(false);
    setLoadingMFA(true);
    setFaceMFAData(null);
    setRetryButtonSubmitFace(false);
    setUserData({ ...userData, errorMfaRecord: "" })

    // clear remove MFA
    setUserData({ ...userData, errorFaceLogin: '' });
    setShowCamRemoveFaceMFA(false);
    setLoadingRemoveMFA(false);
    setImgSrc(null);
    setRetryButtonLoginFace(false);

    const username = router.query.user
    const token = router.query.token

    try {
      const response = await axios.get(
        urlBase + '/api/history/mfa/records',
        {
          headers: {
            'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token 
          },
          params: {
            request_id: uuidv4(),
            username: username
          }
        }
      );

      setFaceMFAData(response.data)
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, errorMfaRecord: error.message })
      setRetryButtonSubmitFace(true);
    }
    setLoadingMFA(false);
  }

  async function handleSubmitFace(event) {
    event.preventDefault()
    setUserData({ ...userData, errorFace: '' })
    setLoading(true);
    setShowCam(false);

    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
    
    const imageBase64 = imageSrc.split(";base64,")[1]

    const username = router.query.user
    const token = router.query.token

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
        setUserData({ ...userData, errorFace: result_message + " code " + result_code })
        setRetryButtonSubmitFace(true);
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, errorFace: error.message })
      setRetryButtonSubmitFace(true);
    }
    setLoading(false)
  }

  async function handleLoginFaceRemoveMFA(event) {
    event.preventDefault()
    setUserData({ ...userData, errorFaceLogin: '' })
    setLoadingRemoveMFA(true);
    setShowCamRemoveFaceMFA(false);

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
            setUserData({ ...userData, errorFaceLogin: result_message_r + " code " + result_code_r })
            setRetryButtonLoginFace(true);
          }
        }
        catch(error) {
          console.error(error)
          setUserData({ ...userData, errorFaceLogin: error.message })
          setRetryButtonLoginFace(true);
        }
      } else if (result_message === 'token invalid') {
        router.push('/login_fail')
      } else {
        setUserData({ ...userData, errorFaceLogin: result_message + " code " + result_code })
        setRetryButtonLoginFace(true);
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, errorFaceLogin: error.message })
      setRetryButtonLoginFace(true);
    }
    setLoadingRemoveMFA(false)
  }

  return (
    <Layout profile>
    <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
    {mfaMethod ? (<>
      {mfaMethod === 1 && <>Your account does not have MFA enabled</>}
      {mfaMethod === 2 && <>Your account have face-based MFA enabled</>}
      {mfaMethod === 3 && <>Your account have voice-based MFA enabled</>}
    </>):(<></>)}
    </div>
    <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
      {mfaMethod === 1 ? (<><button type="submit" onClick={handleEnableFaceMfa}>Enable Face MFA</button> <button type="submit" onClick={handleEnableVoiceMfa}>Enable Voice MFA</button></>):
      (<><button type="submit" onClick={handleViewFaceMFA}>View your MFA records</button>
       <button type="submit" onClick={handleRemoveFaceMFA}>Remove your MFA records</button></>
      ) }
    </div>
    {(!faceMFAData && showMFA && loadingMFA) && 
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
      </div>}
    {(faceMFAData && showMFA) && 
      <div className="face">
      <form>
      <small>Date added:</small> {faceMFAData.added_date}
      {/* <img 
        src={`data:image/jpeg;base64,${faceMFAData.processed_image}`}
      /> */}
        <img 
        src={`data:image/jpeg;base64,${faceMFAData.image}`}
      /></form></div>}

    {/* SUBMIT VOICE FOR MFA */}
    {showVoice && 
      <div className="face">
          <div>
            <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              <h2 style={{backgroundColor: "#DAF7A6"}}>&nbsp;&nbsp;đây là giọng nói của tôi&nbsp;&nbsp;</h2>
            </div>
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
              {mediaBlobUrl && status!=="recording" && <audio src={mediaBlobUrl} controls/>}
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
              <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                {status==="recording" && <button onClick={stopRecording}>Stop Recording</button>}
                {mediaBlobUrl && status!=="recording" && <button>Submit Voice</button>}{mediaBlobUrl &&status!=="recording" && <button onClick={startRecording}>Re-Record</button>}
              </div>
            
          </div>
      </div>
    }
    {/* END SUBMIT VOICE FOR MFA */}

    {/* SUBMIT FACE FOR MFA */}
    {(showCam || loading || userData.errorFace) &&
    <div className="face">
     <form>
     {!loading && showCam && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{router.query.user}</b>, take a photo to create MFA
            </div>}
      {showCam && <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />}
      {showCam && <button type="submit" onClick={handleSubmitFace}>Submit Face</button>}
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
      {loading && imgSrc && (
            <img
              src={imgSrc}
            />
          )}
      {userData.errorFace && <p className="error">Error: {userData.errorFace}</p>}
      { retryButtonSubmitFace && 
            <button type="submit" onClick={handleRetrySubmitFace}>Retry</button>
          }
    </form>
    </div>}
    {/* END SUBMIT FACE FOR MFA */}

    {/* SUBMIT FACE FOR REMOVE MFA */}
    {(showCamRemoveFaceMFA || loadingRemoveMFA || userData.errorFaceLogin) &&
    <div className="face">
     <form>
     {!loadingRemoveMFA && showCamRemoveFaceMFA && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{router.query.user}</b>, verify your face to remove MFA
            </div>}
      {showCamRemoveFaceMFA && <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
      />}
      {showCamRemoveFaceMFA && <button type="submit" onClick={handleLoginFaceRemoveMFA}>Submit Face</button>}
      {loadingRemoveMFA ? (<>
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
      {loadingRemoveMFA && imgSrc && (
            <img
              src={imgSrc}
            />
          )}
      {userData.errorFaceLogin && <p className="error">Error: {userData.errorFaceLogin}</p>}
      { retryButtonLoginFace && 
            <button type="submit" onClick={handleRetryRemoveFaceMF}>Retry</button>
          }
    </form>
    </div>}
    {/* END SUBMIT FACE FOR REMOVE MFA */}
    
    <br/>
    <br/>
    {userData.errorMfa && <p className="error">Error: {userData.errorMfa}</p>}
    
    {/* DISPLAY LOGIN RECORDS */}
     {username && 
     <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{username}</b>'s last 10 login records
      </div>}

      <div className="profile">

      {dataFilter && 
      (<table>
        <thead>
        <tr key={"header"}>
          {Object.keys(dataFilter[0]).map((key) => (
            <th>{key}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {dataFilter.map((item) => (
          <tr key={item.login_at}>
            {Object.entries(item).map((v) => (
              <td>{v[0] === "face_id" ? (<>{<a onClick={() => {handleShowFacePopup(v[1])}}>{v[1]}</a>}</>) : (<>{v[1]==="ok" && <Image
                  priority
                  src="/images/green-tick.png"
                  className={utilStyles.borderCircle}
                  height={20}
                  width={20}
                  />}{v[1]!=="ok" && v[1]}</>)}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>)}
        {userData.error && <p className="error">Error: {userData.error}</p>}
      </div>

      {showFacePopup && 
      <>
      <div>
        <Popup open={showFacePopup} closeOnDocumentClick onClose={closeFacePopup} position="center">
        <div className="popup-content">
          <a className="close" onClick={closeFacePopup}>
            &times;
          </a>
          
          {showFacePopupData && <img src={`data:image/jpeg;base64,${showFacePopupData.image}`}/>}

          {loadingPopupFace && <div>
            <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
              Fetching data ...
            </div>
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
            </div>
            }

        </div>
        </Popup>
        </div>
        </>}
      {/* END DISPLAY LOGIN RECORDS */}
      <style jsx>{`
        .popup-content {
          margin: auto;
          background: rgb(255, 255, 255);
          width: 100%;
          padding: 5px;
          border: 2px solid #ccc;
          border-radius: 8px;
        }
        .popup-arrow {
          color: rgb(255, 255, 255);
          
        }
        [role='tooltip'].popup-content {
          width: 400px;
          box-shadow: rgba(0, 0, 0, 1) 0px 0px 3px;
        }

        .popup-overlay {
          background: rgba(0, 0, 0, 0.5);
        }
        [data-popup='tooltip'].popup-overlay {
          background: transparent;
        }
        .profile {
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justifyContent: center;
        }
        .face {
          max-width: 500px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        th {
          border: 1px solid black;
          margin: 0px 0px;
          padding: 5px 5px;
        }
        td {
          border: 1px solid black;
          margin: 0px 0px;
          padding: 5px 5px;
        }
        a { 
          cursor: pointer; 
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

export default Profile
