import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function NotePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [note, setNote] = useState(null)
    const [tab, setTab] = useState('summary')
    const [flipped, setFlipped] = useState({})

    useEffect(() => {
        api.get(`/notes/${id}`).then(res => setNote(res.data)).catch(() => navigate('/dashboard'))
    }, [id, navigate])

    if (!note) return <div style={{ background: '#0F0F0F', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Loading...</div>

    const c = note.content || {}
    const tabs = ['summary', 'concepts', 'notes', 'flashcards', 'quiz', 'actions']

    const toggleFlip = (i) => setFlipped(f => ({ ...f, [i]: !f[i] }))

    return (
        <div style={styles.app}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sbTop}>
                    <div style={styles.sbBrand}>study<span style={{ color: '#C8A96E' }}>notes</span></div>
                    <div style={styles.sbSub}>your ai study companion</div>
                </div>
                <div style={styles.sbSection}>menu</div>
                <div style={styles.sbItem} onClick={() => navigate('/dashboard')}><span>📚</span> dashboard</div>
                <div style={{ ...styles.sbItem, ...styles.sbItemActive }}><span>🗒️</span> this note</div>
                <div style={styles.sbItem} onClick={() => { localStorage.removeItem('token'); navigate('/login') }}>
                    <span>🚪</span> log out
                </div>
                <div style={styles.sbBottom}>
                    <div style={styles.avatar}>AK</div>
                    <span style={styles.sbUser}>avneet</span>
                </div>
            </div>
    
            {/* Main */}
            <div style={styles.main}>
                <div style={styles.header}>
                    <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>back</button>
                    <div style={styles.headerInfo}>
                        <div style={styles.noteMeta}>{note.source_type} . {new Date(note.created_at).toLocaleDateString()}</div>
                        <h1 style={styles.noteTitle}>{note.title}</h1>
                        {c.tldr && <div style={styles.tldr}><strong style={{ color: '#EDE9E3' }}>tldr:</strong> {c.tldr}</div>}
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabBar}>
                    {tabs.map(t => (
                        <button key={t} style={{ ...styles.tabBtn, ...(tab === t ? styles.tabBtnActive : {}) }} onClick={() => setTab(t)}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={styles.content}>

                    {tab === 'summary' && (
                        <div style={styles.prose}>{c.summary || 'No summary available.'}</div>
                    )}

                    {tab === 'concepts' && (
                        <div style={styles.list}>
                            {(c.key_concepts || []).map((k, i) => (
                                <div key={i} style={styles.conceptCard}>
                                    <div style={styles.conceptTerm}>{k.term}</div>
                                    <div style={styles.conceptDef}>{k.definition}</div>
                                    {k.example && <div style={styles.conceptEx}>💡 {k.example}</div>}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'notes' && (
                        <div style={styles.list}>
                            {(c.detailed_notes || []).map((n, i) => (
                                <div key={i} style={styles.noteSection}>
                                    <div style={styles.noteSectionTitle}>{n.topic}</div>
                                    <div style={styles.noteSectionContent}>{n.content}</div>
                                    {n.bullet_points && (
                                        <ul style={styles.bullets}>
                                            {n.bullet_points.map((b, j) => <li key={j} style={styles.bullet}>{b}</li>)}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'flashcards' && (
                        <div style={styles.flashGrid}>
                            {(c.flashcards || c.qna || []).map((f, i) => (
                                <div key={i} style={styles.flashCard} onClick={() => toggleFlip(i)}>
                                    <div style={styles.flashInner}>
                                        {!flipped[i] ? (
                                            <div style={styles.flashFront}>
                                                <div style={styles.flashLabel}>tap to reveal</div>
                                                <div style={styles.flashQ}>{f.front || f.question}</div>
                                            </div>
                                        ) : (
                                            <div style={styles.flashBack}>
                                                <div style={styles.flashLabel}>answer</div>
                                                <div style={styles.flashA}>{f.back || f.answer}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'quiz' && (
                        <div style={styles.list}>
                            {(c.qna || []).map((q, i) => (
                                <QuizCard key={i} question={q.question} options={q.options} correct={q.correct} explanation={q.explanation} />
                            ))}
                        </div>
                    )}

                    {tab === 'actions' && (
                        <div style={styles.list}>
                            {(c.action_items || []).map((a, i) => (
                                <div key={i} style={styles.actionItem}>
                                    <span style={styles.actionIcon}>☐</span>
                                    <span style={styles.actionText}>{a}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>  
            </div>
        </div>
    )
}

function QuizCard({ question, answer }) {
    const [revealed, setRevealed] = useState(false)
    return (
        <div style={styles.quizCard}>
            <div style={styles.quizQ}>{question}</div>
            {!revealed ? (
                <button style={styles.revealBtn} onClick={() => setRevealed(true)}>Show answer</button>
            ) : (
                <div style={styles.quizA}>{answer}</div>
            )}
        </div>
    )
}

const styles = {
  app: { display: 'flex', height: '100vh', background: '#0F0F0F', color: '#EDE9E3', fontFamily: 'Inter, sans-serif' },
  sidebar: { width: 220, background: '#161616', borderRight: '0.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sbTop: { padding: '20px 16px 14px' },
  sbBrand: { fontSize: 16, fontWeight: 600, color: '#EDE9E3', letterSpacing: '-0.3px' },
  sbSub: { fontSize: 11, color: '#555', marginTop: 3 },
  sbSection: { fontSize: 10, color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '14px 16px 6px' },
  sbItem: { display: 'flex', alignItems: 'center', gap: 9, padding: '9px 16px', fontSize: 13, color: '#666', cursor: 'pointer', borderLeft: '2px solid transparent' },
  sbItemActive: { color: '#EDE9E3', background: 'rgba(255,255,255,0.05)', borderLeftColor: '#C8A96E' },
  sbBottom: { marginTop: 'auto', padding: '14px 16px', borderTop: '0.5px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#C8A96E' },
  sbUser: { fontSize: 12, color: '#666' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '20px 28px', borderBottom: '0.5px solid #2a2a2a', background: '#161616' },
  backBtn: { background: 'none', border: 'none', color: '#C8A96E', fontSize: 13, cursor: 'pointer', marginBottom: 10, padding: 0 },
  headerInfo: {},
  noteMeta: { fontSize: 12, color: '#555', marginBottom: 6, textTransform: 'capitalize' },
  noteTitle: { fontSize: 20, fontWeight: 500, color: '#EDE9E3', marginBottom: 10, lineHeight: 1.3 },
  tldr: { background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#888', lineHeight: 1.6 },
  tabBar: { display: 'flex', borderBottom: '0.5px solid #2a2a2a', background: '#161616', overflowX: 'auto', flexShrink: 0 },
  tabBtn: { padding: '12px 18px', fontSize: 13, color: '#555', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', textTransform: 'capitalize' },
  tabBtnActive: { color: '#EDE9E3', borderBottomColor: '#C8A96E' },
  content: { flex: 1, overflowY: 'auto', padding: '24px 28px' },
  prose: { fontSize: 14, color: '#aaa', lineHeight: 1.8, maxWidth: 720 },
  list: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 },
  conceptCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderLeft: '3px solid #C8A96E', borderRadius: '0 8px 8px 0', padding: '14px 16px' },
  conceptTerm: { fontSize: 14, fontWeight: 500, color: '#EDE9E3', marginBottom: 6 },
  conceptDef: { fontSize: 13, color: '#888', lineHeight: 1.65 },
  conceptEx: { fontSize: 12, color: '#C8A96E', marginTop: 8, fontStyle: 'italic' },
  noteSection: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '16px' },
  noteSectionTitle: { fontSize: 14, fontWeight: 500, color: '#EDE9E3', marginBottom: 8 },
  noteSectionContent: { fontSize: 13, color: '#888', lineHeight: 1.7, marginBottom: 10 },
  bullets: { paddingLeft: 18 },
  bullet: { fontSize: 13, color: '#666', lineHeight: 2 },
  flashGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  flashCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 10, padding: '20px', cursor: 'pointer', minHeight: 120 },
  flashInner: { height: '100%' },
  flashFront: {},
  flashBack: {},
  flashLabel: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 },
  flashQ: { fontSize: 14, fontWeight: 500, color: '#EDE9E3', lineHeight: 1.5 },
  flashA: { fontSize: 13, color: '#888', lineHeight: 1.6 },
  quizCard: { background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8, padding: '16px' },
  quizQ: { fontSize: 14, fontWeight: 500, color: '#EDE9E3', marginBottom: 12 },
  revealBtn: { padding: '8px 16px', borderRadius: 6, background: '#1e1e1e', border: '0.5px solid #333', color: '#888', fontSize: 13, cursor: 'pointer' },
  quizA: { fontSize: 13, color: '#4ade80', lineHeight: 1.6, paddingTop: 10, borderTop: '0.5px solid #2a2a2a' },
  actionItem: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#161616', border: '0.5px solid #2a2a2a', borderRadius: 8 },
  actionIcon: { fontSize: 16, color: '#C8A96E', flexShrink: 0 },
  actionText: { fontSize: 13, color: '#888', lineHeight: 1.6 },
}