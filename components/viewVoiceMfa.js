import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'

export default function ViewVoiceMFA(props) {
    const [voiceMFAData, setVoiceMFAData] = useState(null);
    const [errorMfaRecord, setErrorMfaRecord] = useState("");
    const [loadingMFA, setLoadingMFA] = useState(false);

    useEffect(() => {
        getVoiceMFAData();
      }, []);

    async function getVoiceMFAData() {
        setLoadingMFA(true);
        setVoiceMFAData(null);
        setErrorMfaRecord("");
    
        const username = props.username
        const token = props.token
    
        try {
          const response = await axios.get(
            urlBase + '/api/history/mfa/record/voice',
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
    
          setVoiceMFAData(response.data)
        } catch (error) {
          console.error(error)
          setErrorMfaRecord(error.message )
        }
        setLoadingMFA(false);
      }

    return (
        <>
        {(!voiceMFAData && loadingMFA) && 
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
        {(voiceMFAData) && 
            <div className="face">
            <form>
            <small>Date added:</small> {voiceMFAData.added_date}
            <audio 
              src={`data:audio/wav;base64,${voiceMFAData.voice}`} controls
            />
            {errorMfaRecord && <p className="error">Error: {errorMfaRecord}</p>}
            </form></div>}
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
