export default function ResponsePanel({ response }) {
  if (!response) return null
  const audioSrc = response.audio_url ? `http://localhost:8002${response.audio_url}` : null

  return (
    <div className="response-panel">
      <h3>Réponse</h3>
      <div className="field"><strong>Type :</strong> {response.type}</div>
      <div className="field"><strong>Transcription wolof :</strong> {response.transcript_wolof}</div>
      <div className="field"><strong>Traduction français :</strong> {response.transcript_french}</div>
      <div className="field"><strong>Réponse français :</strong> {response.answer_french}</div>
      <div className="field"><strong>Réponse wolof :</strong> {response.answer_wolof}</div>
      {audioSrc && (
        <div className="field">
          <audio controls src={audioSrc}>
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )}
    </div>
  )
}
