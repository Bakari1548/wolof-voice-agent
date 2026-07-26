const BASE_URL = 'http://localhost:8002'

export async function sendTextQuery(userId, textWolof, currentScreen = null) {
  const body = { user_id: userId, text_wolof: textWolof }
  if (currentScreen) body.current_screen = currentScreen
  const res = await fetch(`${BASE_URL}/debug/text-query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
  return res.json()
}

export async function sendVoiceQuery(userId, audioBlob, currentScreen = null) {
  const formData = new FormData()
  formData.append('user_id', userId)
  formData.append('audio_file', audioBlob, 'recording.webm')
  if (currentScreen) formData.append('current_screen', currentScreen)
  const res = await fetch(`${BASE_URL}/voice-query`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
  return res.json()
}

export async function confirmAction(userId, accepted) {
  const res = await fetch(`${BASE_URL}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, accepted }),
  })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
  return res.json()
}

export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error(`Backend injoignable (${res.status})`)
  return res.json()
}
