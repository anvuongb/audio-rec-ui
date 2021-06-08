import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'

export default function ViewFaceMFA(props) {

    const [faceMFAData, setFaceMFAData] = useState(null);
    const [errorMfaRecord, setErrorMfaRecord] = useState("");
    const [loadingMFA, setLoadingMFA] = useState(false);

    useEffect(() => {
        getFaceMFAData();
      }, []);

    async function getFaceMFAData() {
        setLoadingMFA(true);
        setFaceMFAData(null);
        setErrorMfaRecord("");
    
        const username = props.username
        const token = props.token
    
        try {
          const response = await axios.get(
            urlBase + '/api/history/mfa/record/face',
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
          setErrorMfaRecord(error.message)
        }
        setLoadingMFA(false);
      }

  return (
      <>
        {(!faceMFAData && loadingMFA) && 
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
        {(faceMFAData ) && 
            <div className="face">
                <form>
                    <small>Date added:</small> {faceMFAData.added_date}
                    {/* <img 
                        src={`data:image/jpeg;base64,${faceMFAData.processed_image}`}
                    /> */}
                        <img 
                        src={`data:image/jpeg;base64,${faceMFAData.image}`}
                    />
                    {errorMfaRecord && <p className="error">Error: {errorMfaRecord}</p>}
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
