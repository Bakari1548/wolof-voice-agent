import { useState, useEffect } from 'react'
import { checkHealth } from './api'
import TextQuery from './components/TextQuery'
import VoiceRecorder from './components/VoiceRecorder'
import ResponsePanel from './components/ResponsePanel'
import ConfirmPanel from './components/ConfirmPanel'

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

  return (
    <div className="app">
      <header>
        <h1>Wolof Voice Agent — Interface de test</h1>
        <span className={`health ${health || 'unknown'}`}>
          Backend : {health === 'ok' ? 'OK' : health === 'ko' ? 'Injoignable' : '...'}
        </span>
      </header>

      <section className="config">
        <label>
          user_id
          <input value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>
        <label>
          current_screen (optionnel)
          <input value={currentScreen} onChange={(e) => setCurrentScreen(e.target.value)} />
        </label>
      </section>

      <nav className="tabs">
        <button className={tab === 'text' ? 'active' : ''} onClick={() => setTab('text')}>Texte</button>
        <button className={tab === 'voice' ? 'active' : ''} onClick={() => setTab('voice')}>Voix</button>
      </nav>

      <main>
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
      </main>

      {loading && <div className="loading">Chargement...</div>}
      {error && <div className="error">{error}</div>}

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
