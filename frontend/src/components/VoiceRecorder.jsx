import { useState, useRef } from 'react'
import { sendVoiceQuery } from '../api'

export default function VoiceRecorder({ userId, currentScreen, onResponse, onLoading, onError }) {
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onLoading(true)
        onError(null)
        try {
          const data = await sendVoiceQuery(userId, blob, currentScreen || null)
          onResponse(data)
        } catch (err) {
          onError(err.message)
        } finally {
          onLoading(false)
          stream.getTracks().forEach((t) => t.stop())
        }
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (err) {
      onError(`Micro inaccessible : ${err.message}`)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  return (
    <div className="voice-recorder">
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
      </button>
      {recording && <span className="recording-badge">Enregistrement...</span>}
    </div>
  )
}
