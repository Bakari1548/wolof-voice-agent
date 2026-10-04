import { confirmAction } from '../api'
import Icon from './Icon'

export default function ConfirmPanel({ userId, details, onResponse, onLoading, onError }) {
  async function handleConfirm(accepted) {
    onLoading(true)
    onError(null)
    try {
      const data = await confirmAction(userId, accepted)
      onResponse(data)
    } catch (err) {
      onError(err.message)
    } finally {
      onLoading(false)
    }
  }

  return (
    <div className='confirm glass' role='dialog' aria-labelledby='confirm-title'>
      <div className='confirm__icon' aria-hidden='true'>
        <Icon name='alertTriangle' size={28} />
      </div>
      <h2 id='confirm-title' className='confirm__title'>
        Confirmation requise
      </h2>
      <p className='confirm__action'>
        Action : <strong>{details?.action || 'inconnue'}</strong>
      </p>
      <pre className='confirm__details'>{JSON.stringify(details?.details, null, 2)}</pre>
      <div className='confirm__actions'>
        <button type='button' className='btn btn--success' onClick={() => handleConfirm(true)}>
          <Icon name='check' size={18} /> Oui
        </button>
        <button type='button' className='btn btn--danger' onClick={() => handleConfirm(false)}>
          <Icon name='x' size={18} /> Non
        </button>
      </div>
    </div>
  )
}
