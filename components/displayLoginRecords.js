import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'
import Popup from 'reactjs-popup'
import {useRouter} from 'next/router'

export default function DisplayLoginRecords(props) {
    const router = useRouter()
    
    const [loadingPopupFace, setLoadingPopupFace] = useState(false);
    const [loadingPopupVoice, setLoadingPopupVoice] = useState(false);

    const [dataFilter, setDataFilter] = useState(null);
    const [showFacePopup, setShowFacePopup] = useState(false);
    const [showFacePopupData, setShowFacePopupData] = useState(null);

    const [showVoicePopup, setShowVoicePopup] = useState(false);
    const [showVoicePopupData, setShowVoicePopupData] = useState(null);

    const [errorFacePopup, setErrorFacePopup] = useState("");
    const [errorVoicePopup, setErrorVoicePopup] = useState("");

    const [popUpVoiceId, setPopUpVoiceId] = useState(null);
    const [popupFaceId, setPopupFaceId] = useState(null);

    const closeFacePopup = () => {
        setShowFacePopup(false);
        setShowFacePopupData(null);
        setLoadingPopupFace(false);
        setPopupFaceId(null);
      }
    
    const closeVoicePopup = () => {
        setShowVoicePopup(false);
        setShowVoicePopupData(null);
        setLoadingPopupVoice(false);
        setPopUpVoiceId(null);
      }

      useEffect(() => {
        if (!props.username || !props.token) {
          return;
        }
        fetchLoginData();
    
      }, [props.username, props.token]);

    const fetchLoginData = async() => {
        const username = props.username
        const token = props.token
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
                Object.entries(d).filter(([k,v]) => k==='login_method' || k==='result_message' || k==='login_at' ||k==='face_id'||k==='voice_id').map(([k,v]) => ({[k]:v}))
            ))
            setDataFilter(dataF)
        }
        catch (error) {
          console.error(error)
          router.push('/login_fail');
        }
      }
    
    async function handleShowFacePopup(faceId) {
        setShowFacePopup(true);
        setLoadingPopupFace(true);
        setPopupFaceId(faceId);
    
        const username = props.username
        const token = props.token
    
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
          setErrorFacePopup(error.message)
        }
        setLoadingPopupFace(false);
      }
    
    async function handleShowVoicePopup(voiceId) {
        setShowVoicePopup(true);
        setLoadingPopupFace(true);
        setPopUpVoiceId(voiceId)
    
        const username = props.username
        const token = props.token
    
        try {
          const response = await axios.get(
            urlBase + '/api/history/voice/voice',
            {
              headers: {
                'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token 
              },
              params: {
                request_id: uuidv4(),
                voice_id: voiceId,
                username: username,
              }
            }
          );
    
          setShowVoicePopupData(response.data)
        } catch (error) {
          console.error(error)
          setErrorVoicePopup(error.message)
        }
        setLoadingPopupFace(false);
      }

  return (
      <>
     <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <b>{props.username}</b>'s last 10 login records
      </div>

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
              <td>{v[0] === "face_id" || v[0] === "voice_id" ? 
                (v[0] === "face_id" ? 
                  (<>{<a onClick={() => {handleShowFacePopup(v[1])}}>{v[1]}</a>}</>)
                  :
                  (<>{<a onClick={() => {handleShowVoicePopup(v[1])}}>{v[1]}</a>}</>)
                ) 
                : 
                (<>{v[1]==="ok" && <Image
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
        {errorFacePopup && <p className="error">Error: {errorFacePopup}</p>}
      </div>

      {/* DISPLAY VOICE POPUP */}
      {showVoicePopup && 
      <>
      <div>
        <Popup open={showVoicePopup} closeOnDocumentClick onClose={closeVoicePopup} position="center">
        <div className="popup-content">
          <a className="close" onClick={closeVoicePopup}>
            &times;
          </a>
          {showVoicePopupData && <small>Voice ID: {popUpVoiceId}</small>}
          {showVoicePopupData && <div><audio src={`data:audio/wav;base64,${showVoicePopupData.voice}`} controls/></div>}

          {loadingPopupVoice && <div>
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
          {errorVoicePopup && <p className="error">Error: {errorVoicePopup}</p>}

        </div>
        </Popup>
        </div>
        </>}
      {/* END DISPLAY VOICE POPUP */}

      {/* DISPLAY FACE POPUP */}
      {showFacePopup && 
      <>
      <div>
        <Popup open={showFacePopup} closeOnDocumentClick onClose={closeFacePopup} position="center">
        <div className="popup-content">
          <a className="close" onClick={closeFacePopup}>
            &times;
          </a>
          {showFacePopupData && <small>Face ID: {popupFaceId}</small>}
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
            {errorFacePopup && <p className="error">Error: {errorFacePopup}</p>}

        </div>
        </Popup>
        </div>
        </>}
      {/* END DISPLAY FACE POPUP */}
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
          /* overflow-x: scroll; */
          overflow-y: scroll;
          /* max-width: 800px; */
          max-height: 400px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .face {
          max-width: 550px;
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
    </>
  )
}
