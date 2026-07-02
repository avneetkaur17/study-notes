import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="hero">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" width="34" height="34">
            <path d="M12 3L4 7v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V7l-8-4z"
              stroke="#C8C2B4" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M9 12l2.2 2.2 3.8-4"
              stroke="#C8C2B4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="brand-name">StudyNotes</h1>
        <p className="brand-tagline">Study Smarter. Learn Better.</p>
        <button className="btn-signup" onClick={() => navigate('/signup')}>Sign Up</button>
        <button className="btn-login" onClick={() => navigate('/login')}>Log In</button>
      </div>
    </div>
  )
}
