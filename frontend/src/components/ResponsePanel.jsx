import { BASE_URL } from '../api'
import Icon from './Icon'

export default function ResponsePanel({ response, onDismiss }) {
  if (!response || response.type === 'confirmation_requise') return null

  const audioSrc = response.audio_url ? `${BASE_URL}${response.audio_url}` : null
  const hasUser = response.transcript_wolof || response.transcript_french
  const hasAnswer = response.answer_wolof || response.answer_french

  if (!hasUser && !hasAnswer) return null

  return (
    <section className='conversation glass' aria-live='polite'>
      <div className='conversation__head'>
        <span className='conversation__title'>
          <Icon name='sparkles' size={18} /> Dernier échange
        </span>
        {onDismiss && (
          <button type='button' className='icon-btn icon-btn--ghost' onClick={onDismiss} aria-label='Fermer'>
            <Icon name='x' size={18} />
          </button>
        )}
      </div>

      <div className='conversation__thread'>
        {hasUser && (
          <article className='bubble bubble--user'>
            <span className='bubble__label'>Toi</span>
            {response.transcript_wolof && <p className='bubble__primary'>{response.transcript_wolof}</p>}
            {response.transcript_french && (
              <p className='bubble__secondary'>{response.transcript_french}</p>
            )}
          </article>
        )}

        {hasAnswer && (
          <article className='bubble bubble--assistant'>
            <span className='bubble__label'>Assistant</span>
            {response.answer_wolof && <p className='bubble__primary'>{response.answer_wolof}</p>}
            {response.answer_french && (
              <p className='bubble__secondary'>{response.answer_french}</p>
            )}
            {audioSrc && (
              <div className='bubble__audio'>
                <Icon name='volume' size={16} />
                <audio controls src={audioSrc} preload='none'>
                  Lecture audio non supportée
                </audio>
              </div>
            )}
          </article>
        )}
      </div>

      {response.type && (
        <footer className='conversation__meta'>
          <Icon name='tag' size={14} />
          {response.type}
        </footer>
      )}
    </section>
  )
}
