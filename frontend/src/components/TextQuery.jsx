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
    <form onSubmit={handleSubmit} className='text-compose'>
      <header className='text-compose__head'>
        <Icon name='message' size={22} />
        <div>
          <h2 className='text-compose__title'>Message en wolof</h2>
          <p className='text-compose__sub'>Écris comme tu parlerais — la réponse sera vocalisée</p>
        </div>
      </header>
      <textarea
        className='text-compose__input'
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder='Naata le prix bu suukar bi?'
        rows={5}
      />
      <button type='submit' disabled={!text.trim()} className='btn btn--primary'>
        <Icon name='send' size={18} />
        Envoyer
      </button>
    </form>
  )
}
