import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch {
      setError('Invalid email or password.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="ac-logo">StudyNotes</div>
        <div className="ac-tag">Study Smarter. Learn Better.</div>
        <h2 className="ac-title">Welcome back</h2>

        {error && <p className="ac-error">{error}</p>}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            placeholder="avneet@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="ac-btn" onClick={handleLogin}>Log in</button>

        <div className="ac-divider">
          <div className="ac-line"></div>
          <span className="ac-or">or</span>
          <div className="ac-line"></div>
        </div>

        <p className="ac-switch">
          Don't have an account?{' '}
          <a onClick={() => navigate('/signup')}>Sign up</a>
        </p>
        <p className="ac-back" onClick={() => navigate('/')}>← Back to home</p>
      </div>
    </div>
  )
}
