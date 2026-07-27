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
    <div className='confirm-panel'>
      <div className='panel-header warning'>
        <Icon name='alertTriangle' size={20} /> Confirmation requise
      </div>
      <p className='confirm-action'>Action : {details?.action || 'inconnue'}</p>
      <pre>{JSON.stringify(details?.details, null, 2)}</pre>
      <div className='confirm-buttons'>
        <button className='btn-success' onClick={() => handleConfirm(true)}>
          <Icon name='check' size={18} /> Oui
        </button>
        <button className='btn-danger' onClick={() => handleConfirm(false)}>
          <Icon name='x' size={18} /> Non
        </button>
      </div>
    </div>
  )
}
