import { useState, useRef, useEffect } from 'react'
import { sendVoiceQuery } from '../api'
import Icon from './Icon'

export default function VoiceRecorder({ userId, currentScreen, onResponse, onLoading, onError }) {
  const [recording, setRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (recording) {
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [recording])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const supported =
        typeof MediaRecorder !== 'undefined' &&
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported('audio/webm')
      const mediaRecorder = supported
        ? new MediaRecorder(stream, { mimeType: 'audio/webm' })
        : new MediaRecorder(stream)
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

      mediaRecorder.onerror = (e) => {
        onError(`Erreur d'enregistrement : ${e.message || 'inconnue'}`)
        setRecording(false)
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
    <div className='voice-recorder'>
      <div className={`mic-button-wrap ${recording ? 'recording' : ''}`}>
        <button
          type='button'
          className={`mic-button ${recording ? 'recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? 'Arrêter' : 'Enregistrer'}
        >
          <Icon name={recording ? 'square' : 'mic'} size={32} />
        </button>
      </div>
      {recording ? (
        <span className='recording-timer'>
          <span className='pulse-dot' /> Enregistrement {recordTime}s
        </span>
      ) : (
        <p className='rec-hint'>Appuie sur le micro pour parler en wolof</p>
      )}
    </div>
  )
}
