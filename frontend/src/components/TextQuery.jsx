import { useState } from 'react'
import { sendTextQuery } from '../api'
import Icon from './Icon'

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
    <form onSubmit={handleSubmit} className='query-form'>
      <label className='query-label'>
        <span>
          <Icon name='message' size={18} /> Texte en wolof
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Naata le prix bu suukar bi? — Naga def, mba yagui ci diam. Mane dama bouguona kham lane guen di diay'
          rows={4}
        />
      </label>
      <button type='submit' disabled={!text.trim()} className='btn-primary'>
        <Icon name='send' size={18} /> Envoyer
      </button>
    </form>
  )
}
