import { useState, useEffect } from 'react'
import { getHistory } from '../api'
import Icon from './Icon'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR')
}

export default function HistoryPanel({ userId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)
    getHistory(userId)
      .then(setHistory)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className='history-status'>
        <Icon name='loader' size={20} className='spin' /> Chargement de l'historique...
      </div>
    )
  }

  if (error) {
    return (
      <div className='history-status error'>
        <Icon name='alertCircle' size={20} /> {error}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className='history-status'>
        <Icon name='clock' size={20} /> Aucun échange trouvé pour <strong>{userId}</strong>.
      </div>
    )
  }

  return (
    <div className='history-panel'>
      <div className='history-header'>
        <Icon name='clock' size={20} /> Historique de <strong>{userId}</strong>
      </div>
      <ul className='history-list'>
        {history.map((item, index) => (
          <li key={item._id || index} className='history-card'>
            <div className='history-meta'>
              <span className='history-type'>
                <Icon name='tag' size={14} /> {item.type}
              </span>
              <span className='history-date'>{formatDate(item.created_at)}</span>
            </div>
            <div className='history-block'>
              <span className='history-label'>
                <Icon name='message' size={14} /> Wolof
              </span>
              <p>{item.transcript_wolof || '—'}</p>
            </div>
            <div className='history-block'>
              <span className='history-label'>
                <Icon name='robot' size={14} /> Réponse
              </span>
              <p>{item.answer_wolof || '—'}</p>
            </div>
            {item.audio_url && (
              <audio
                controls
                src={`http://localhost:8002${item.audio_url}`}
                className='history-audio'
              >
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
