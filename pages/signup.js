import { useState } from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import urlBase from '../constant/url'
import Head from 'next/head'

function Signup() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    retype_password: '',
    password_match: false,
    error: '',
  })
  const [passwdMatch, setPasswdMatch] = useState(false)
  const [passwdOk, setPasswdOk] = useState(false)

  async function checkPassword(e, eType) {
    if (eType === "password") {
      if (e.target.value === userData.retype_password) {
        setPasswdMatch(true)
      } else {
        setPasswdMatch(false)
      }
    } else {
      if (e.target.value  === userData.password) {
        setPasswdMatch(true)
      } else {
        setPasswdMatch(false)
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })

    const username = userData.username
    const password = userData.password

    try {
      const response = await fetch(urlBase + '/api/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"request_id":"test", "user_name":username, "user_passwd":password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }
      const r = await response.json()
      const result_code = r.result_code
      const result_message = r.result_message
      if (result_code == 1) {
        Router.push('/signup_success')
      } else {
        setUserData({ ...userData, error: result_message + " code " + result_code })
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
    }
  }

  return (
    <Layout signup>
      <Head>
        <title>Signup page</title>
      </Head>
      <div className="signup">
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>

          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={(event) =>{
              setUserData(
                Object.assign({}, userData, { username: event.target.value })
              )
            }
            }
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={(event) =>
              {
              setUserData(
                Object.assign({}, userData, { password: event.target.value })
              )
              checkPassword(event, "password")
            }
            }
          />

          <label htmlFor="retype_password">Re-type Password </label> 
          
          <input
            type="password"
            id="retype_password"
            name="retype_password"
            value={userData.retype_password}
            onChange={(event) =>
              {setUserData(
                Object.assign({}, userData, { retype_password: event.target.value })
              )
              checkPassword(event, "retype_password")}
            }
          />
          {!passwdMatch && userData.password !== '' ? (
            <><small>password does not match </small></>
          ) : (
            <></>
          )} 
          {!passwdMatch || userData.username === '' || userData.password === '' ? (<></>) : (<button type="submit">Sign up</button>) }

          {userData.error && <p className="error">Error: {userData.error}</p>}
        </form>
      </div>
      <style jsx>{`
        .signup {
          max-width: 340px;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
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

        small {
          font-size: smaller;
          color: red;
        }

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

export default Signup
