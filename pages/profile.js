import { useState, useEffect, useRef } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'

import EnableVoiceMFA from '../components/enableVoiceMfa'
import EnableVoiceMFAV2 from '../components/enableVoiceMfaV2'
import RemoveVoiceMFA from '../components/removeVoiceMfa'
import ViewVoiceMFA from '../components/viewVoiceMfa'

import EnableFaceMFA from '../components/enableFaceMfa'
import RemoveFaceMFA from '../components/removeFaceMfa'
import ViewFaceMFA from '../components/viewFaceMfa'

import DisplayLoginRecords from '../components/displayLoginRecords'

import Head from 'next/head'

function Profile() {
  const router = useRouter()

  const [showEnableVoiceMFADialog, setShowEnableVoiceMFADialog] = useState(false);
  const [showRemoveVoiceMFADialog, setShowRemoveVoiceMFADialog] = useState(false);
  const [showVoiceMFA, setShowVoiceMFA] = useState(false);

  const [showEnableFaceMFADialog, setShowEnableFaceMFADialog] = useState(false);
  const [showRemoveFaceMFADialog, setShowRemoveFaceMFADialog] = useState(false);
  const [showFaceMFA, setShowFaceMFA] = useState(false);

  const [errorMfa, setErrorMfa] = useState("");
  const [mfaMethod, setMfaMethod] = useState(null);

  const username = router.query.user;
  const token = router.query.token;

  useEffect(() => {
    if (!username || !token) {
      return;
    }
    fetchMfaMethod();

  }, [username, token]);

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
      setErrorMfa(error.message);
      router.push('/login_fail');
    }
  }

  // VOICE MFA FUNCTIONS
  function handleEnableVoiceMfa(event) {
    event.preventDefault();
    setShowEnableVoiceMFADialog(!showEnableVoiceMFADialog);

    // disable face mfa
    setShowEnableFaceMFADialog(false);
  } 
  function handleRemoveVoiceMFA(event) {
    event.preventDefault()
    setShowRemoveVoiceMFADialog(!showRemoveVoiceMFADialog);

    // clear view MFA
    setShowVoiceMFA(false);
  }

  function handleViewVoiceMFA(event) {
    event.preventDefault()
    setShowVoiceMFA(!showVoiceMFA)

    // clear remove MFA
    setShowRemoveVoiceMFADialog(false);
  }
  // END VOICE MFA FUNCTIONS


  // FACE MFA FUNCTIONS
  function handleEnableFaceMfa(event) {
    event.preventDefault()
    setShowEnableFaceMFADialog(!showEnableFaceMFADialog);

    // disable voice mfa
    setShowEnableVoiceMFADialog(false);
  }

  async function handleRemoveFaceMFA(event) {
    event.preventDefault()
    setShowRemoveFaceMFADialog(!showRemoveFaceMFADialog);

    // clear view MFA
    setShowFaceMFA(false);
  }

  function handleViewFaceMFA(event) {
    event.preventDefault()
    setShowFaceMFA(!showFaceMFA)

    // clear remove MFA
    setShowRemoveFaceMFADialog(false);
  }
 // END FACE MFA FUNCTIONS
  return (
    <Layout profile>
      <Head>
        <title>User profile page</title>
      </Head>
    <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
    {mfaMethod ? (<>
      {mfaMethod === 1 && <>Your account does not have MFA enabled</>}
      {mfaMethod === 2 && <>Your account has face-based MFA enabled</>}
      {mfaMethod === 3 && <>Your account has voice-based MFA enabled</>}
    </>):(<></>)}
    </div>
    <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
      {mfaMethod === 1 ? (<><button type="submit" onClick={handleEnableFaceMfa}>Enable Face MFA</button> <button type="submit" onClick={handleEnableVoiceMfa}>Enable Voice MFA</button></>):
      (<></>) }
      {mfaMethod === 2 ? (<><button type="submit" onClick={handleViewFaceMFA}>View your face-based  MFA records</button>
       <button type="submit" onClick={handleRemoveFaceMFA}>Remove your face-based MFA records</button></>):
      (<></>) }
      {mfaMethod === 3 ? (<><button type="submit" onClick={handleViewVoiceMFA}>View your voice-based MFA records</button>
       <button type="submit" onClick={handleRemoveVoiceMFA}>Remove your voice-based MFA records</button></>):
      (<></>) }
      
      {errorMfa && <p className="error">Error: {errorMfa}</p>}
    </div>
    {/* SHOW FACE MFA */}
    {showFaceMFA && <ViewFaceMFA
      username={router.query.user}
      token={router.query.token}
    />}
    {/* END SHOW FACE MFA */}

    {/* SHOW VOICE MFA */}
    {showVoiceMFA && <ViewVoiceMFA
      username={router.query.user}
      token={router.query.token}
    />}
    {/* END SHOW VOICE MFA */}

    {/* SUBMIT VOICE FOR MFA */}
    {showEnableVoiceMFADialog && <EnableVoiceMFAV2 
      username={router.query.user}
      token={router.query.token}
      />}
    {/* END SUBMIT VOICE FOR MFA */}

    {/* SUBMIT VOICE FOR REMOVE MFA */}
    {showRemoveVoiceMFADialog && <RemoveVoiceMFA 
      username={router.query.user}
      token={router.query.token}
      />}
    {/* END SUBMIT VOICE FOR REMOVE MFA */}

    {/* SUBMIT FACE FOR MFA */}
    {showEnableFaceMFADialog && <EnableFaceMFA 
      username={router.query.user}
      token={router.query.token}
      />}
    {/* END SUBMIT FACE FOR MFA */}

    {/* SUBMIT FACE FOR REMOVE MFA */}
    {showRemoveFaceMFADialog && <RemoveFaceMFA 
      username={router.query.user}
      token={router.query.token}
      />}
    {/* END SUBMIT FACE FOR REMOVE MFA */}
    
    {/* DISPLAY LOGIN RECORDS */}
    <br/>
    <br/>
    <DisplayLoginRecords 
      username={router.query.user}
      token={router.query.token}
      />
    {/* END DISPLAY LOGIN RECORDS */}

      <style jsx>{`
        .profile {
          margin: 0 auto;
          padding: 1rem;
          display: flex;
          justifyContent: center;
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
