import { useState, useEffect, useRef } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import Webcam from "react-webcam";
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image'


function Profile() {
  const router = useRouter()
  const [data, setData] = useState(null);
  const webcamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingMFA, setLoadingMFA] = useState(false);
  const [dataFilter, setDataFilter] = useState(null);
  const [mfaMethod, setMfaMethod] = useState(null);
  const [showCam, setShowCam] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [retryButton, setRetryButton] = useState(false);

  const [showMFA, setShowMFA] = useState(false);
  const [faceMFAData, setFaceMFAData] = useState(null);

  const username = router.query.user;
  const token = router.query.token;

  const [userData, setUserData] = useState({
    error: '',
    errorMfa: '',
    errorFace: '',
    errorMfaRecord: '',
  })
  const fetchData = async() => {
    try {
      const response = await axios.get(
        'http://192.168.1.6:8580/api/history/login/records',
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
            Object.entries(d).filter(([k,v]) => k==='login_method' || k==='result_message' || k==='created_at').map(([k,v]) => ({[k]:v}))
        ))
        setData(response.data)
        setDataFilter(dataF)
    }
    catch (error) {
      console.error(error)
      setData(null);
      setUserData({ ...userData, errorMfa: error.message })
    }
  }

  const fetchMfaMethod = async() => {
    try {
      const response = await axios.get(
        'http://192.168.1.6:8580/api/history/login/mfa',
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
      setUserData({ ...userData, error: error.message })
    }
  }

  useEffect(() => {
    if (!username || !token) {
      return;
    }
    fetchData();
    fetchMfaMethod();

  }, [username, token]);

  async function handleEnableFaceMfa(event) {
    event.preventDefault()
    setShowCam(!showCam);
    setLoading(false);
    setImgSrc(null);
    setRetryButton(false);
  }

  function handleRetry() {
    setLoading(false);
    setShowCam(true);
    setRetryButton(false);
    setUserData({ ...userData, errorFace: "" })
  }

  async function handleViewFaceMFA(event) {
    event.preventDefault()
    setShowMFA(!showMFA)
    setShowCam(false);
    setLoadingMFA(true);
    setFaceMFAData(null);
    setRetryButton(false);

    const username = router.query.user
    const token = router.query.token

    try {
      const response = await axios.get(
        'http://192.168.1.6:8580/api/history/mfa/records',
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
      setRetryButton(true);
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
    console.log(imageBase64);

    const username = router.query.user
    const token = router.query.token

    try {
      const response = await fetch('http://192.168.1.6:8580/api/create/face', {
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
        router.push('/mfa_success')
      } else {
        setUserData({ ...userData, errorFace: result_message + " code " + result_code })
        setRetryButton(true);
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, errorFace: error.message })
      setRetryButton(true);
    }
    setLoading(false)
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
      {mfaMethod === 1 ? (<><button type="submit" onClick={handleEnableFaceMfa}>Enable Face MFA</button> <button type="submit">Enable Voice MFA</button></>):
      (<><button type="submit" onClick={handleViewFaceMFA}>View your MFA records</button></>) }
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
    {(showCam || loading || userData.errorFace) &&
    <div className="face">
     <form>
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
      { retryButton && 
            <button type="submit" onClick={handleRetry}>Retry</button>
          }
    </form>
    </div>}
    
    <br/>
    <br/>
    {userData.errorMfa && <p className="error">Error: {userData.errorMfa}</p>}
    
    
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
            <th>{key !== "created_at" ? (<>{key}</>) : (<>login_time</>)}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {dataFilter.map((item) => (
          <tr key={item.created_at}>
            {Object.values(item).map((val) => (
              <td>{val}</td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>)}
        {userData.error && <p className="error">Error: {userData.error}</p>}
      </div>
      <style jsx>{`
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
