import Icon from './Icon'

export default function ResponsePanel({ response }) {
  if (!response) return null
  const audioSrc = response.audio_url ? `http://localhost:8002${response.audio_url}` : null

  return (
    <div className='response-panel'>
      <div className='panel-header'>
        <Icon name='messageSquare' size={20} /> Réponse
      </div>
      <div className='response-grid'>
        <div className='response-item'>
          <span className='response-key'>
            <Icon name='tag' size={16} /> Type
          </span>
          <span>{response.type}</span>
        </div>
        <div className='response-item'>
          <span className='response-key'>
            <Icon name='message' size={16} /> Transcription wolof
          </span>
          <span>{response.transcript_wolof}</span>
        </div>
        <div className='response-item'>
          <span className='response-key'>
            <Icon name='activity' size={16} /> Traduction français
          </span>
          <span>{response.transcript_french}</span>
        </div>
        <div className='response-item'>
          <span className='response-key'>
            <Icon name='robot' size={16} /> Réponse français
          </span>
          <span>{response.answer_french}</span>
        </div>
        <div className='response-item'>
          <span className='response-key'>
            <Icon name='message' size={16} /> Réponse wolof
          </span>
          <span>{response.answer_wolof}</span>
        </div>
      </div>
      {audioSrc && (
        <div className='audio-box'>
          <div className='audio-label'>
            <Icon name='play' size={16} /> Écouter la réponse
          </div>
          <audio controls src={audioSrc}>
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )}
    </div>
  )
}
