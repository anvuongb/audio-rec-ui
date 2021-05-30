import { useState, useEffect } from 'react'
import {useRouter} from 'next/router'
import Layout from '../components/layout'


function Profile() {
  const router = useRouter()
  const [data, setData] = useState(null);

  const username = router.query.user;
  const token = router.query.token;

  const [userData, setUserData] = useState({
    username: '',
    password: '',
    error: '',
  })

  useEffect(() => {
    if (!username || !token) {
      return;
    }
    fetch('http://192.168.1.6:8580/api/login/records?request_id=test&username='+username, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
      }).then( response => {
        response.json()
      }).then(data => {
        console.log(data)
        setData(data);
      }).catch(error => {
        console.error(error)
        setUserData({ ...userData, error: error.message })
      })
  }, [username, token]);


  return (
    <Layout profile>
      <div className="profile">
        {data}
      </div>
      <style jsx>{`
        /* .profile {
          max-width: 340px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        } */

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
