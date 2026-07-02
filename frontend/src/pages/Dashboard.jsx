import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
    const [notes, setNotes] = useState([])
    const [url, setUrl] = useState('')
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')
    const [activeTab, setActiveTab] = useState('youtube')
    const [file, setFile] = useState(null)
    const navigate = useNavigate()

   const fetchNotes = () => {
    api.get('/notes/').then(res => setNotes(res.data))
   }

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const res = await api.get('/notes/')
                if (!cancelled) setNotes(res.data)
            } catch {
                if (!cancelled) navigate ('/login')
                }
        }
        load()
        return () => {cancelled = true }
    }, [navigate])

    const handleYoutube = async () => {
        if (!url || !title) return
        setLoading(true)
        setStatus('Submitting...')
        try {
            const res = await api.post('/notes/youtube', { url, title })
            setUrl('')
            setTitle('')
            pollJob(res.data.job_id, res.data.note_id)
        } catch {
            setStatus('Failed to submit.')
            setLoading(false)
        }
    }

    const handleUpload = async () => {
        if (!file || !title) return
        setLoading(true)
        setStatus('Uploading...')
        const form = new FormData()
        form.append('file', file)
        form.append('title', title)
        try {
            const res = await api.post('/notes/upload', form)
            setFile(null)
            setTitle('')
            pollJob(res.data.job_id, res.data.note_id)
        } catch {
            setStatus('Failed to upload.')
            setLoading(false)
        }
    }

    const pollJob = (jobId, noteId) => {
        setStatus('Processing...')
        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/notes/jobs/${jobId}`)
                const s = res.data.status
                setStatus(`Status: ${s}`)
                if (s === 'completed') {
                    clearInterval(interval)
                    setLoading(false)
                    setStatus('✅ Done!')
                    fetchNotes()
                    setTimeout(() => navigate(`/notes/${noteId}`), 800)
                } else if (s === 'failed') {
                    clearInterval(interval)
                    setLoading(false)
                    setStatus('❌ Failed')
                }
            } catch {
                clearInterval(interval)
                setLoading(false)
            }
        }, 2000)
    }

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    const statusColor = (s) => {
        if (s === 'completed') return '#4ade80'
        if (s === 'failed') return '#f87171'
        return '#fbbf24'
    }

    return (
        <div style={styles.app}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sbTop}>
                    <div style={styles.sbBrand}>study<span style={{ color: '#C8A96E' }}>notes</span></div>
                    <div style={styles.sbSub}>your ai study companion</div>
                </div>

                <div style={styles.sbSection}>menu</div>
                <div style={{ ...styles.sbItem, ...styles.sbItemActive }}>
                    <span>📚</span> dashboard
                </div>
                <div style={styles.sbItem} onClick={() => navigate('/dashboard')}>
                    <span>🗒️</span> all notes
                </div>
                <div style={styles.sbItem} onClick={logout}>
                    <span>🚪</span> log out
                </div>

                <div style={styles.sbSection}>recent</div>
                {notes.slice(0, 5).map(n => (
                    <div key={n.id} style={styles.sbNote} onClick={() => navigate(`/notes/${n.id}`)}>
                        <div style={styles.sbNoteTitle}>{n.title}</div>
                        <div style={{ ...styles.sbNoteMeta, color: statusColor(n.job_status) }}>
                            {n.job_status}
                        </div>
                    </div>
                ))}

                <div style={styles.sbBottom}>
                    <div style={styles.avatar}>AK</div>
                    <span style={styles.sbUser}>avneet</span>
                </div>
            </div>

            {/* Main */}
            <div style={styles.main}>
                {/* Topbar */}
                <div style={styles.topbar}>
                    <h1 style={styles.topbarTitle}>Dashboard</h1>
                </div>

                <div style={styles.body}>
                    {/* Add Note Card */}
                    <div style={styles.card}>
                    <div style={styles.cardTitle}>Add a new note</div>

                    <div style={styles.tabRow}>
                        <button
                            style={{ ...styles.tabBtn, ...(activeTab === 'youtube' ? styles.tabBtnActive : {}) }}
                            onClick={() => setActiveTab('youtube')}
                        >
                            🎬 YouTube URl 
                        </button>
                        <button
                            style={{ ...styles.tabBtn, ...(activeTab === 'voice' ? styles.tabBtnActive : {}) }}
                            onClick={() => setActiveTab('voice')}
                        >
                            🎙️ Voice Memo
                        </button>
                    </div>

                    {activeTab === 'youtube' && (
                        <div style={styles.inputGroup}>
                            <input
                                style={styles.input}
                                placeholder="https://youtube.com/watch?v=..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                            <input
                                style={styles.input}
                                placeholder="Title (e.g. DSA lecture week 3)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <button
                                style={{ ...styles.genBtn, opacity: loading ? 0.6 : 1 }}
                                onClick={handleYoutube}
                                disabled={loading}
                            >
                                {loading ? status : '✨ Generate Notes'}
                            </button>
                        </div>
                    )}

                    {activeTab === 'voice' && (
                        <div style ={styles.inputGroup}>
                            <div style={styles.uploadZone} onClick={() => document.getElementById('fileInput').click()}>
                                <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                                <div style={{ fontSize: 13, color: '#888' }}>
                                    {file ? file.name : 'Click to upload audio file'}
                                </div>
                                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>mp3 . wav . m4a . mp4</div>
                                <input
                                    id="fileInput"
                                    type="file"
                                    accept="audio/*,video/mp4"
                                    style={{ display: 'none' }}
                                    onChange={e => setFile(e.target.files[0])}
                                />
                            </div>
                            <input
                                style={styles.input}
                                placeholder="Title (e.g. ML lecture week 4)"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                            <button
                                style={{ ...styles.genBtn, opacity: loading ? 0.6 : 1 }}
                                onClick={handleUpload}
                                disabled={loading}
                            >
                                {loading ? status : '✨ Generate Notes'}
                            </button>
                        </div>
                    )}
                    </div>

                    {/* Recent Notes */}
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>Recent Notes</div>
                        {notes.length === 0 && (
                            <p style={{ fontSize: 13, color: '#888' }}>No notes yet - add one above!</p>
                        )}
                        {notes.map(note => (
                            <div
                                key={note.id}
                                style={styles.noteRow}
                                onClick={() => note.job_status === 'completed' && navigate(`/notes/${note.id}`)}
                            >
                                <div style={{ ...styles.noteDot, background: statusColor(note.job_status) }} />
                                <div style={styles.noteInfo}>
                                    <div style={styles.noteRowTitle}>{note.title}</div>
                                    <div style={styles.noteRowMeta}>
                                        {note.source_type} . {new Date(note.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{
                                    ...styles.badge,
                                    background: note.job_status === 'completed' ? '#1a3a1a' : '#3a2a0a',
                                    color: statusColor(note.job_status),
                                }}>
                                    {note.job_status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

const styles = {
    app: {
        display: 'flex', height: '100vh', background: '#0F0F0F', color: '#EDE9E3', fontFamily: 'Inter, sans-serif',
    },
    sidebar: {
        width: 220, background: '#161616', borderRight: '0.5px solid #2a2a2a',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
    },
    sbTop: { padding: '20px 16px 14px' },
    sbBrand: { fontSize: 16, fontWeight: 600, color: '#EDE9E3', letterSpacing: '-0.3px' },
    sbSub: { fontSize: 11, color: '#555', marginTop: 3 },
    sbSection: { fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 16px 6px' },
    sbItem: {
        display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px',
        fontSize: 13, color: '#666', cursor: 'pointer', borderLeft: '2px solid transparent',
    },
    sbItemActive: { color: '#EDE9E3', background: 'rgba(255,255,255,0.05)', borderLeftColor: '#C8A96E' },
    sbNote: { padding: '8px 16px', cursor: 'pointer', borderBottom: '0.5px solid #1e1e1e' },
    sbNoteTitle: { fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    sbNoteMeta: { fontSize: 11, marginTop: 2 },
    sbBottom: {
        marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #2a2a2a',
        display: 'flex', alignItems: 'center', gap: 10,
    },
    avatar: {
        width: 28, height: 28, borderRadius: '50%', background: '#2a2a2a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#C8A96E',
    },
    sbUser: { fontSize: 12, color: '#666' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: {
        height: 52, borderBottom: '0.5px solid #2a2a2a', display: 'flex',
        alignItems: 'center', padding: '0 28px', background: '#161616',
    },
    topbarTitle: { fontSize: 16, fontWeight: 500, color: '#EDE9E3' },
    body: { flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 },
    card: {
        background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 12, padding: '20px 22px',
    },
    cardTitle: { fontSize: 13, fontWeight: 500, color: '#EDE9E3', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' },
    tabRow: { display: 'flex', gap: 8, marginBottom: 16 },
    tabBtn: {
        padding: '7px 16px', borderRadius: 20, border: '0.5px solid #2a2a2a',
        background: 'transparent', color: '#666', fontSize: 13, cursor: 'pointer',
    },
    tabBtnActive: { background: '#1e1e1e', color: '#EDE9E3', borderColor: '#444' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: 10 },
    input: {
        padding: '11px 14px', borderRadius: 8, border: '0.5px solid #2a2a2a',
        background: '#1a1a1a', color: '#EDE9E3', fontSize: 14, outline: 'none',
    },
    uploadZone: {
        border: '1.5px dashed #2a2a2a', borderRadius: 10, padding: '28px 20px',
        textAlign: 'center', cursor: 'pointer', background: '#1a1a1a',
    },
    genBtn: {
        padding: '12px', borderRadius: 8, background: '#C8A96E', color: '#0F0F0F',
        border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
    },
    noteRow: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
        borderBottom: '0.5px solid #1e1e1e', cursor: 'pointer',
    },
    noteDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
    noteInfo: { flex: 1, minWidth: 0 },
    noteRowTitle: { fontSize: 13, fontWeight: 500, color: '#EDE9E3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    noteRowMeta: { fontSize: 11, color: '#555', marginTop: 2 },
    badge: { fontSize: 11, padding: '3px 10px', borderRadius: 20, flexShrink: 0 },
}