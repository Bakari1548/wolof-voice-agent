import { useState, useEffect } from 'react'
import { checkHealth } from './api'
import Icon from './components/Icon'
import TextQuery from './components/TextQuery'
import VoiceRecorder from './components/VoiceRecorder'
import ResponsePanel from './components/ResponsePanel'
import ConfirmPanel from './components/ConfirmPanel'
import HistoryPanel from './components/HistoryPanel'

function App() {
  const [userId, setUserId] = useState('u1')
  const [currentScreen, setCurrentScreen] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [health, setHealth] = useState(null)
  const [tab, setTab] = useState('text')

  useEffect(() => {
    checkHealth().then(() => setHealth('ok')).catch(() => setHealth('ko'))
  }, [])

  const healthConfig = {
    ok: { label: 'En ligne', className: 'ok', icon: 'check' },
    ko: { label: 'Hors ligne', className: 'ko', icon: 'x' },
  }
  const healthState = health
    ? healthConfig[health]
    : { label: 'Connexion...', className: 'unknown', icon: 'loader' }

  return (
    <div className='app'>
      <div className='gradient-bg' />

      <header className='app-header'>
        <div className='brand'>
          <div className='logo'>
            <Icon name='headphones' size={28} />
          </div>
          <div>
            <h1>Wolof Voice Agent</h1>
            <p>Assistant vocal intelligent</p>
          </div>
        </div>
        <div className={`health-badge ${healthState.className}`}>
          <Icon name={healthState.icon} size={16} className={health === null ? 'spin' : ''} />
          <span>{healthState.label}</span>
        </div>
      </header>

      <section className='hero'>
        <div className='hero-text'>
          <h2>Parle en wolof, reçois une réponse vocale</h2>
          <p>Mode texte ou voix · Traduction automatique · TTS Oolel</p>
        </div>
        <div className='hero-illustration' aria-hidden='true'>
          <svg viewBox='0 0 200 140' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <linearGradient id='g1' x1='0' y1='0' x2='1' y2='1'>
                <stop offset='0%' stopColor='#ffffff' stopOpacity='0.25' />
                <stop offset='100%' stopColor='#ffffff' stopOpacity='0.05' />
              </linearGradient>
            </defs>
            <rect x='20' y='30' width='160' height='80' rx='20' fill='url(#g1)' />
            <circle cx='70' cy='70' r='22' fill='#ffffff' fillOpacity='0.9' />
            <path d='M70 58v24 M61 64a9 9 0 0 0 18 0' stroke='#4f46e5' strokeWidth='2' fill='none' strokeLinecap='round' />
            <rect x='64' y='82' width='12' height='8' rx='2' fill='#4f46e5' />
            <rect x='58' y='88' width='24' height='4' rx='2' fill='#4f46e5' />
            <rect x='120' y='50' width='50' height='34' rx='8' fill='#ffffff' fillOpacity='0.95' />
            <path d='M135 61h20 M135 68h15 M135 75h22' stroke='#7c3aed' strokeWidth='3' strokeLinecap='round' />
            <circle cx='155' cy='99' r='10' fill='#22c55e' fillOpacity='0.9' />
            <path d='M151 99l3 3 6-6' stroke='#ffffff' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' fill='none' />
          </svg>
        </div>
      </section>

      <section className='config-card'>
        <div className='field-group'>
          <label>
            <Icon name='user' size={16} /> Identifiant
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder='u1'
            />
          </label>
          <label>
            <Icon name='monitor' size={16} /> Écran courant
            <input
              value={currentScreen}
              onChange={(e) => setCurrentScreen(e.target.value)}
              placeholder='accueil'
            />
          </label>
        </div>
      </section>

      <nav className='tabs'>
        <button className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>
          <Icon name='message' size={18} /> Texte
        </button>
        <button className={tab === 'voice' ? 'active' : ''} onClick={() => setTab('voice')}>
          <Icon name='mic' size={18} /> Voix
        </button>
        <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>
          <Icon name='clock' size={18} /> Historique
        </button>
      </nav>

      <main className='main-card'>
        {tab === 'text' && (
          <TextQuery
            userId={userId}
            currentScreen={currentScreen}
            onResponse={setResponse}
            onLoading={setLoading}
            onError={setError}
          />
        )}
        {tab === 'voice' && (
          <VoiceRecorder
            userId={userId}
            currentScreen={currentScreen}
            onResponse={setResponse}
            onLoading={setLoading}
            onError={setError}
          />
        )}
        {tab === 'history' && <HistoryPanel userId={userId} />}
      </main>

      {loading && (
        <div className='loading-toast'>
          <Icon name='loader' size={20} className='spin' />
          <span>Traitement en cours...</span>
        </div>
      )}

      {error && (
        <div className='error-toast'>
          <Icon name='alertCircle' size={20} />
          <span>{error}</span>
        </div>
      )}

      {response?.type === 'confirmation_requise' && (
        <ConfirmPanel
          userId={userId}
          details={response.confirmation_details}
          onResponse={setResponse}
          onLoading={setLoading}
          onError={setError}
        />
      )}

      <ResponsePanel response={response} />
    </div>
  )
}

export default App
