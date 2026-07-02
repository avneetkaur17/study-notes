import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    try {
      const res = await api.post('/auth/register', { email, password })
      localStorage.setItem('token', res.data.access_token)
      navigate('/dashboard')
    } catch {
      setError('Could not create account. Email may already be taken.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="ac-logo">StudyNotes</div>
        <div className="ac-tag">Study Smarter. Learn Better.</div>
        <h2 className="ac-title">Create your account</h2>

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
            placeholder="Choose a password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="ac-btn" onClick={handleSignup}>Create account</button>

        <div className="ac-divider">
          <div className="ac-line"></div>
          <span className="ac-or">or</span>
          <div className="ac-line"></div>
        </div>

        <p className="ac-switch">
          Already have an account?{' '}
          <a onClick={() => navigate('/login')}>Log in</a>
        </p>
        <p className="ac-back" onClick={() => navigate('/')}>← Back to home</p>
      </div>
    </div>
  )
}
