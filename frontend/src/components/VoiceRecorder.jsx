import { useState, useRef, useEffect } from 'react'
import { sendVoiceQuery } from '../api'
import Icon from './Icon'

export default function VoiceRecorder({
  userId,
  currentScreen,
  onResponse,
  onLoading,
  onError,
  loading = false,
}) {
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
    if (loading) return
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

  const stateClass = recording ? 'is-recording' : loading ? 'is-processing' : 'is-idle'

  return (
    <div className={`voice-orb ${stateClass}`}>
      <div className='voice-orb__rings' aria-hidden='true'>
        <span className='ring ring--1' />
        <span className='ring ring--2' />
        <span className='ring ring--3' />
      </div>

      <div className='voice-orb__viz' aria-hidden='true'>
        {[...Array(12)].map((_, i) => (
          <span key={i} className='viz-bar' style={{ '--i': i }} />
        ))}
      </div>

      <button
        type='button'
        className='voice-orb__btn'
        onClick={recording ? stopRecording : startRecording}
        disabled={loading && !recording}
        aria-label={recording ? 'Arrêter' : loading ? 'Traitement…' : 'Parler'}
      >
        {loading && !recording ? (
          <Icon name='loader' size={36} className='spin' />
        ) : (
          <Icon name={recording ? 'square' : 'mic'} size={36} />
        )}
      </button>

      <p className='voice-orb__hint'>
        {recording ? (
          <>
            <span className='rec-live' />
            Enregistrement · {recordTime}s
          </>
        ) : loading ? (
          'Analyse de ta voix…'
        ) : (
          'Appuie pour parler'
        )}
      </p>
    </div>
  )
}
