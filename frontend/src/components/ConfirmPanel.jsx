import { confirmAction } from '../api'

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
    <div className="confirm-panel">
      <h3>Confirmation requise</h3>
      <p>Action : {details?.action || 'inconnue'}</p>
      <pre>{JSON.stringify(details?.details, null, 2)}</pre>
      <div className="confirm-buttons">
        <button className="btn-yes" onClick={() => handleConfirm(true)}>Oui</button>
        <button className="btn-no" onClick={() => handleConfirm(false)}>Non</button>
      </div>
    </div>
  )
}
