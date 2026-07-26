import { useState } from 'react'
import { sendTextQuery } from '../api'

export default function TextQuery({ userId, currentScreen, onResponse, onLoading, onError }) {
  const [text, setText] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onLoading(true)
    onError(null)
    try {
      const data = await sendTextQuery(userId, text, currentScreen || null)
      onResponse(data)
    } catch (err) {
      onError(err.message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="query-form">
      <label>
        Texte wolof
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Naata le prix bu suukar bi? -- Naga def, mba yagui ci diam. Mane dama bouguona kham lane guen di diay"
          rows={3}
        />
      </label>
      <button type="submit" disabled={!text.trim()}>
        Envoyer
      </button>
    </form>
  )
}
