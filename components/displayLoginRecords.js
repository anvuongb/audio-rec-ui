import Image from 'next/image'
import utilStyles from '../styles/utils.module.css'
import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'
import urlBase from '../constant/url'
import Popup from 'reactjs-popup'
import {useRouter} from 'next/router'
import RandomLoadingIcon from './loading';

export default function DisplayLoginRecords(props) {
    const router = useRouter()
    const tableRef = useRef(null);

    const records_per_page = 20
    
    const [currentPageNumber, setCurrentPageNumber] = useState(1);

    const [loadingPopupVoice, setLoadingPopupVoice] = useState(false);
    const [loadingFetchingData, setLoadingFetchingData] = useState(false);

    const [dataFilter, setDataFilter] = useState(null);

    const [showVoicePopup, setShowVoicePopup] = useState(false);
    const [showVoicePopupData, setShowVoicePopupData] = useState(null);

    const [showViewMatchingRecordsPopup, setShowViewMatchingRecordsPopup] = useState(false);

    const [errorVoicePopup, setErrorVoicePopup] = useState("");
    const [errorViewMatchingRecordsPopup, setErrorViewMatchingRecordsPopup] = useState("");

    const [popUpVoiceId, setPopUpVoiceId] = useState(null);

    
    const closeVoicePopup = () => {
        setShowVoicePopup(false);
        setShowVoicePopupData(null);
        setLoadingPopupVoice(false);
        setPopUpVoiceId(null);
      }

    const closeViewMatchingRecordsPopup = () => {
      setShowViewMatchingRecordsPopup(false);
      setShowViewMatchingRecordsPopupData(null);
      setLoadingViewMatchingRecords(false);
    }

    useEffect(() => {
      fetchLoginData();
    }, [currentPageNumber]);

    function handlePrevPage() {
      if (currentPageNumber > 1) {
        setCurrentPageNumber(currentPageNumber - 1);
      }
    }

    function handleNextPage() {
      if (dataFilter) {
        setCurrentPageNumber(currentPageNumber + 1);
      }
    }

    function handlePrevPrevPage() {
      if (currentPageNumber - 10 <= 1) {
        setCurrentPageNumber(1);
      } else {
        setCurrentPageNumber(currentPageNumber - 10);
      }
    }

    function handleNextNextPage() {
      if (dataFilter) {
        setCurrentPageNumber(currentPageNumber + 10);
      }
    }

    const fetchLoginData = async() => {
        setLoadingFetchingData(true);
        const current_page_number = currentPageNumber
        try {
          const response = await axios.get(
            urlBase + '/api/getVoiceRecords',
            {
              headers: {
                'Content-Type': 'application/json'
              },
              params: {
                request_id: uuidv4(),
                // limit: login_counts,
                page_number: current_page_number,
                records_per_page: records_per_page,
              }
            }
          );
          if (response.data.length > 0) {
            const dataF = response.data.map((d) => Object.assign({}, ...
              Object.entries(d).filter(([k,v]) => k==='request_id' || k==='file_id' || k==='generated_text' || k==='created_at_str' || k==='masked_file_uploaded' || k==='nomasked_file_uploaded').map(([k,v]) => {
                if (v==="request_id") {
                  return {[k]:"Request ID"}
                }
                if (v==="file_id") {
                  return {[k]:"File ID"}
                }
                if (v==="generated_text") {
                  return {[k]:"Generated Text"}
                }
                if (v==="created_at") {
                  return {[k]:"Created At"}
                }
                return {[k]:v}
              })
            ))
            console.log(dataF)
            setDataFilter(dataF);
          } else {
            setDataFilter(null);
          }
          
        }
        catch (error) {
          console.error(error)
          router.push('/login_fail');
        }
        setTimeout(
          ()=>{
            setLoadingFetchingData(false);
          },
          1000,
      )
      }
    
    async function handleShowVoicePopup(fileId, masked) {
        setShowVoicePopup(true);
        setLoadingPopupVoice(true);
        setPopUpVoiceId(fileId)
    
        try {
          const response = await axios.get(
            urlBase + '/api/getAudioDetails',
            {
              headers: {
                'Content-Type': 'application/json'
              },
              params: {
                request_id: uuidv4(),
                file_id: fileId,
                masked: masked,
              }
            }
          );
    
          setShowVoicePopupData(response.data)
        } catch (error) {
          console.error(error)
          setErrorVoicePopup(error.message)
        }
        setLoadingPopupVoice(false);
      }

  return (
      <>
      {/* Next/Prev Page */}
      <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <p><a onClick={() => {handlePrevPrevPage()}}>{"<<"}</a>&nbsp;&nbsp;<a onClick={() => {handlePrevPage()}}>{"<"}</a>&nbsp;< font style={{color: "black"}}>&nbsp;&nbsp;&nbsp;&nbsp;<b>{currentPageNumber}</b>&nbsp;&nbsp;&nbsp;&nbsp;</font>&nbsp;<a onClick={() => {handleNextPage()}}>{">"}&nbsp;</a> <a onClick={() => {handleNextNextPage()}}>{">>"}</a></p>
      </div>

      <div style={{
                display:"flex",
                justifyContent:"center",
            }}> 
      </div>

      {loadingFetchingData && <div>
            <div style={{
                  display:"flex",
                  justifyContent:"center",
              }}>
                <Image
                  priority
                  src="/images/loadingcolor.gif"
                  height={150}
                  width={200}
                  />
            </div>
          </div>}
      {!dataFilter && !loadingFetchingData && <>
      <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            it seems you have reached the end, no more data to show
      </div>
      <div style={{
            display:"flex",
            justifyContent:"center"}}>
        <div style={{
                    height:200,
                    width:200,
                    position:"relative"
                }}>
                  <Image
                    priority
                    src="/images/nodata.jpg"
                    // className={utilStyles.borderCircle}
                    // height={100}
                    // width={300}
                    layout="fill"
                    objectFit="contain"
                    />
        </div>
      </div>
      </>}
      <div className="profile">
      {dataFilter && !loadingFetchingData && 
      (<div style={{
        display:"flex",
        justifyContent:"center"}}><table ref={tableRef}>
        <thead>
        <tr key={"header"}>{Object.keys({"File ID":"", "Generated Text":"", "Mask off audio":"", "Mask on audio":"", "Date created":""}).map((key) => (<th key={uuidv4()}>{key}</th>))}</tr>
        </thead>
        <tbody>
        {dataFilter.map((item) => (
          <tr key={uuidv4()}>
            <td key={uuidv4()}>{item["file_id"]}</td>
            <td key={uuidv4()}>{item["generated_text"]}</td>
            {item["nomasked_file_uploaded"]===1 && <td key={uuidv4()}><a onClick={() => {handleShowVoicePopup(item["file_id"], false)}}><Image
                  priority
                  src="/images/play.png"
                  className={utilStyles.borderCircle}
                  height={35}
                  width={35}
                  /></a> <a href={urlBase + '/api/getAudioRaw/'+ item["file_id"] + '_nomasked.wav'}><Image
                  priority
                  src="/images/Download.png"
                  className={utilStyles.borderCircle}
                  height={35}
                  width={35}
                  /></a></td>}
            {!item["nomasked_file_uploaded"] && <td key={uuidv4()}>No file uploaded</td>}
            {item["masked_file_uploaded"]===1 && <td key={uuidv4()}><a onClick={() => {handleShowVoicePopup(item["file_id"], true)}}><Image
                  priority
                  src="/images/play.png"
                  className={utilStyles.borderCircle}
                  height={35}
                  width={35}
                  /></a> <a href={urlBase + '/api/getAudioRaw/'+ item["file_id"] + '_masked.wav'}><Image
                  priority
                  src="/images/Download.png"
                  className={utilStyles.borderCircle}
                  height={35}
                  width={35}
                  /></a></td>}
            {!item["masked_file_uploaded"] && <td key={uuidv4()}>No file uploaded</td>}
            <td key={uuidv4()}>{item["created_at_str"]}</td>
          </tr>
        ))}
        </tbody>
      </table>
      </div>)}
      </div>
      {/* Next/Prev Page */}
      {!loadingFetchingData && <div style={{
                display:"flex",
                justifyContent:"center",
            }}>
            <p><a onClick={() => {handlePrevPrevPage()}}>{"<<"}</a>&nbsp;&nbsp;<a onClick={() => {handlePrevPage()}}>{"<"}</a>&nbsp;< font style={{color: "black"}}>&nbsp;&nbsp;&nbsp;&nbsp;<b>{currentPageNumber}</b>&nbsp;&nbsp;&nbsp;&nbsp;</font>&nbsp;<a onClick={() => {handleNextPage()}}>{">"}&nbsp;</a> <a onClick={() => {handleNextNextPage()}}>{">>"}</a></p>
      </div>}
      {/* DISPLAY MATCH RECORDS POPUP */}
      {showViewMatchingRecordsPopup && 
      <>
      <div>
        <Popup open={showViewMatchingRecordsPopup} closeOnDocumentClick onClose={closeViewMatchingRecordsPopup} position="center">
        <div className="popup-content">
          <a className="close" onClick={closeViewMatchingRecordsPopup}>
            &times;
          </a>
          
          {errorViewMatchingRecordsPopup && <p className="error">Error: {errorViewMatchingRecordsPopup}</p>}

        </div>
        </Popup>
        </div>
        </>}
      {/* END DISPLAY MATCH RECORDS POPUP */}

      {/* DISPLAY VOICE POPUP */}
      {showVoicePopup && 
      <>
      <div>
        <Popup open={showVoicePopup} closeOnDocumentClick onClose={closeVoicePopup} position="center">
        <div className="popup-content">
          <a className="close" onClick={closeVoicePopup}>
            &times;
          </a>
          {showVoicePopupData && <div><audio src={`data:audio/wav;base64,${showVoicePopupData.audio_byte}`} controls/></div>}

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
      {/* END DISPLAY FACE POPUP */}
      <style jsx>{`
        .popup-content {
          margin: auto;
          background: rgb(255, 255, 255);
          width: 100%;
          max-width: 760px;
          max-height: 500px;
          padding: 20px;
          border: 2px solid #ccc;
          overflow-y: auto;
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
          overflow-x: auto;
          width: 100%;
        }
        .face {
          max-width: 550px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        tr:hover {background-color: #f5f5f5;}
        th {
          // border: 1px solid black;
          border-bottom: 3px solid #ddd;
          margin: 0px 0px;
          padding: 5px 5px;
          word-wrap:break-word;
          background-color: #606060;
          color: white;
        }
        td {
          // border: 1px solid black;
          border-bottom: 3px solid #ddd;
          margin: 0px 0px;
          padding: 5px 5px;
          word-wrap:break-word;
        }
        table tr td:nth-child(1){
          width: 38%;
          border-right: 1px solid #ddd;
        }
        table tr td:nth-child(2){
          width: 38%;
          border-right: 1px solid #ddd;
        }
        table tr td:nth-child(4){
          width: 38%;
          border-left: 1px solid #ddd; 
          border-right: 1px solid #ddd;
        }
        table
        {
          border-collapse: collapse;
          table-layout: fixed;
          justify-content: center;
          width: 100%;
          min-width: 725px;
          height: 100%;
        }
        table tr th:nth-child(1){
          width: 18%;
        }
        table tr th:nth-child(2){
          width: 25%;
        }
        table tr th:nth-child(3){
          width: 20%;
        }
        table tr th:nth-child(4){
          width: 20%;
        }

        .table-view tr td:nth-child(1){
          width: 38%;
          border-right: 1px solid #ddd;
        }
        .table-view tr td:nth-child(2){
          width: 38%;
          border-right: 1px solid #ddd;
        }
        .table-view tr td:nth-child(4){
          width: 38%;
          border-left: 1px solid #ddd; 
          border-right: 1px solid #ddd;
        }
        .table-view tr th:nth-child(1){
          width: 15%;
        }
        .table-view tr th:nth-child(2){
          width: 40%;
        }
        .table-view tr th:nth-child(3){
          width: 17.5%;
        }
        .table-view tr th:nth-child(4){
          width: 17.5%;
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
        /* Dropdown Button */
        .dropbtn {
          background-color: #04AA6D;
          color: white;
          padding: 16px;
          font-size: 16px;
          border: none;
          cursor: pointer;
        }
        
        /* Dropdown button on hover & focus */
        .dropbtn:hover, .dropbtn:focus {
          background-color: #3e8e41;
        }
        
        /* The search field */
        #myInput {
          box-sizing: border-box;
          background-image: url('searchicon.png');
          background-position: 14px 12px;
          background-repeat: no-repeat;
          font-size: 16px;
          padding: 14px 20px 12px 45px;
          border: none;
          border-bottom: 1px solid #ddd;
        }
        
        /* The search field when it gets focus/clicked on */
        #myInput:focus {outline: 3px solid #ddd;}
        
        /* The container <div> - needed to position the dropdown content */
        .dropdown {
          position: relative;
          display: inline-block;
        }
        
        /* Dropdown Content (Hidden by Default) */
        .dropdown-content {
          display: show;
          position: absolute;
          background-color: #f6f6f6;
          min-width: 230px;
          border: 1px solid #ddd;
          z-index: 1;
        }
        
        /* Links inside the dropdown */
        .dropdown-content a {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
        }
        
        /* Change color of dropdown links on hover */
        .dropdown-content a:hover {background-color: #f1f1f1}
        
        /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
        .show {display:block;} 


        .collapsible {
          background-color: #777;
          color: white;
          cursor: pointer;
          padding: 18px;
          max-width:400px;
          border: none;
          text-align: left;
          outline: none;
          font-size: 15px;
        }
        .collapsible:hover {
          background-color: #555;
        }
        // .active {
        //   background-color: #555;
        // }
        
        .collapsible:after {
          content: ${`"\\002B"`};
          color: white;
          font-weight: bold;
          float: right;
          margin-left: 5px;
        }
        
        .active:after {
          content: ${`"\\2212"`};
        }
        
        .content {
          padding: 0 18px;
          max-height: 0;
          overflow: hidden;
          transition: 0.5s ease-in;
        }
      `}</style>
    </>
  )
}
