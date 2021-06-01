import { useState } from 'react'
import Router from 'next/router'
import Layout from '../components/layout'
import { v4 as uuidv4 } from 'uuid';
import urlBase from '../constant/url'


function Login() {
  const [userData, setUserData] = useState({
    username: '',
    password: '',
    error: '',
  })

  async function handleSubmit(event) {
    event.preventDefault()
    setUserData({ ...userData, error: '' })

    const username = userData.username
    const password = userData.password

    try {
      const response = await fetch(urlBase + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"request_id":uuidv4(), "user_name":username, "user_passwd":password }),
      })

      if (response.status !== 200) {
        throw new Error(await response.text())
      }
      const r = await response.json()
      const result_code = r.result_code
      const result_message = r.result_message
      const next_step = r.next_step
      const token = r.token
      if (result_code === 1 && next_step === "done") {
        Router.push('/login_success?next_step=done&user='+username+'&token='+token)
      } else if (result_code === 1 && next_step === "biometrics_face") {
        Router.push('/login_success?next_step=biometrics_face&user='+username+'&token='+token)
      } else {
        setUserData({ ...userData, error: result_message + " code " + result_code })
      }
    } catch (error) {
      console.error(error)
      setUserData({ ...userData, error: error.message })
    }
  }

  return (
    <Layout login>
      <div className="login">
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>

          <input
            type="text"
            id="username"
            name="username"
            value={userData.username}
            onChange={(event) =>
              setUserData(
                Object.assign({}, userData, { username: event.target.value })
              )
            }
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={userData.password}
            onChange={(event) =>
              setUserData(
                Object.assign({}, userData, { password: event.target.value })
              )
            }
          />

          <button type="submit">Login</button>

          {userData.error && <p className="error">Error: {userData.error}</p>}
        </form>
      </div>
      <style jsx>{`
        .login {
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

        .error {
          margin: 0.5rem 0 0;
          color: brown;
        }
      `}</style>
    </Layout>
  )
}

export default Login
