import { useState, useEffect } from 'react'
import { getHistory, BASE_URL } from '../api'
import Icon from './Icon'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
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
      <div className='empty-state'>
        <Icon name='loader' size={24} className='spin' />
        <p>Chargement de l&apos;historique…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='empty-state empty-state--error'>
        <Icon name='alertCircle' size={24} />
        <p>{error}</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className='empty-state'>
        <Icon name='clock' size={24} />
        <p>Aucun échange pour <strong>{userId}</strong></p>
      </div>
    )
  }

  return (
    <div className='history'>
      <header className='history__head'>
        <Icon name='clock' size={22} />
        <div>
          <h2 className='history__title'>Historique</h2>
          <p className='history__sub'>{userId} · {history.length} échange{history.length > 1 ? 's' : ''}</p>
        </div>
      </header>
      <ul className='history__list'>
        {history.map((item, index) => (
          <li key={item._id || index} className='history__item'>
            <div className='history__item-top'>
              <span className='history__badge'>{item.type}</span>
              <time className='history__time'>{formatDate(item.created_at)}</time>
            </div>
            {item.transcript_wolof && (
              <p className='history__line'>
                <span className='history__who'>Toi</span>
                {item.transcript_wolof}
              </p>
            )}
            {item.answer_wolof && (
              <p className='history__line history__line--reply'>
                <span className='history__who'>Assistant</span>
                {item.answer_wolof}
              </p>
            )}
            {item.audio_url && (
              <audio controls src={`${BASE_URL}${item.audio_url}`} className='history__audio' preload='none' />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
