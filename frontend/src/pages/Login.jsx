import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'

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
            setError('Invalid email or password')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: "url('/bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                marginTop: '-60px',
            }}>
                <div style={{ fontSize: 38, fontWeight: 600, color: '#0D1B2A', letterSpacing: '-0.5px' }}>
                    StudyNotes
                </div>
                <div style={{ fontSize: 15, color: '#1a2e40', marginBottom: 8 }}>
                    Study Smarter. Learn Better.
                </div>

                {error && <p style={{ color: 'red', fontSize: 13 }}>{error}</p>}

                <input
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                />
                <button onClick={handleLogin} style={btnStyle}>Log In</button>
                <Link to="/signup">
                    <button style={{ ...btnStyle, background: 'rgba(255,248,220,0.7)' }}>
                        Sign up
                    </button>
                </Link>
            </div>
        </div>
    )
}

const inputStyle = {
    width: 220,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1.5px solid rgba(255,220,100,0.5)',
    background: 'rgba(255,248,220,0.85)',
    fontSize: 14,
    color: '#0D1B2A',
    outline: 'none',
}

const btnStyle = {
    width: 220,
    padding: '13px 0px',
    borderRadius: 10,
    background: 'rgba(255,248,220,0.92)',
    color: '#0D1B2A',
    border: '1.5px solid rgba(255,230,140,0.6)',
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
}