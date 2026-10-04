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
  const [tab, setTab] = useState('voice')
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    checkHealth().then(() => setHealth('ok')).catch(() => setHealth('ko'))
  }, [])

  const modes = [
    { id: 'voice', label: 'Voix', icon: 'mic' },
    { id: 'text', label: 'Texte', icon: 'message' },
    { id: 'history', label: 'Historique', icon: 'clock' },
  ]

  return (
    <div className='assistant'>
      <div className='ambient' aria-hidden='true'>
        <div className='ambient-orb ambient-orb--1' />
        <div className='ambient-orb ambient-orb--2' />
        <div className='ambient-orb ambient-orb--3' />
      </div>

      <header className='top-bar'>
        <div className='brand'>
          <div className='brand-mark'>
            <Icon name='wave' size={22} />
          </div>
          <div className='brand-text'>
            <span className='brand-name'>Wolof Voice</span>
            <span className='brand-tag'>Assistant intelligent</span>
          </div>
        </div>
        <div className='top-actions'>
          <span
            className={`status-pill status-pill--${health ?? 'pending'}`}
            title={health === 'ok' ? 'Backend connecté' : health === 'ko' ? 'Backend hors ligne' : 'Vérification…'}
          >
            <span className='status-dot' />
            {health === 'ok' ? 'En ligne' : health === 'ko' ? 'Hors ligne' : '…'}
          </span>
          <button
            type='button'
            className={`icon-btn ${settingsOpen ? 'icon-btn--active' : ''}`}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label='Paramètres'
            aria-expanded={settingsOpen}
          >
            <Icon name='settings' size={20} />
          </button>
        </div>
      </header>

      {settingsOpen && (
        <section className='settings-sheet glass'>
          <h3 className='settings-title'>Session</h3>
          <div className='settings-fields'>
            <label className='field'>
              <span>Identifiant utilisateur</span>
              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder='u1'
                autoComplete='off'
              />
            </label>
            <label className='field'>
              <span>Écran courant (optionnel)</span>
              <input
                value={currentScreen}
                onChange={(e) => setCurrentScreen(e.target.value)}
                placeholder='accueil'
                autoComplete='off'
              />
            </label>
          </div>
        </section>
      )}

      <main className='stage'>
        {tab === 'voice' && (
          <div className='stage-voice'>
            <div className='stage-intro'>
              <h1 className='stage-headline'>
                {loading ? 'Je réfléchis…' : "Comment puis-je t'aider ?"}
              </h1>
              <p className='stage-sub'>
                Parle en wolof — transcription, traduction et réponse vocale Oolel
              </p>
            </div>
            <VoiceRecorder
              userId={userId}
              currentScreen={currentScreen}
              onResponse={setResponse}
              onLoading={setLoading}
              onError={setError}
              loading={loading}
            />
          </div>
        )}
        {tab === 'text' && (
          <div className='stage-panel glass'>
            <TextQuery
              userId={userId}
              currentScreen={currentScreen}
              onResponse={setResponse}
              onLoading={setLoading}
              onError={setError}
            />
          </div>
        )}
        {tab === 'history' && (
          <div className='stage-panel glass stage-panel--scroll'>
            <HistoryPanel userId={userId} />
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

        <ResponsePanel response={response} onDismiss={() => setResponse(null)} />
      </main>

      <nav className='mode-nav glass' aria-label='Mode d&apos;interaction'>
        {modes.map(({ id, label, icon }) => (
          <button
            key={id}
            type='button'
            className={`mode-nav__btn ${tab === id ? 'mode-nav__btn--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon name={icon} size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {(loading || error) && (
        <div className='toast-stack'>
          {loading && tab !== 'voice' && (
            <div className='toast toast--info'>
              <Icon name='loader' size={18} className='spin' />
              Traitement en cours…
            </div>
          )}
          {error && (
            <div className='toast toast--error' role='alert'>
              <Icon name='alertCircle' size={18} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
