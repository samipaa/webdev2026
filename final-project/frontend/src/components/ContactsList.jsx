import { useEffect, useState } from 'react'

function ContactsList() {
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/contact-requests')

        if (!response.ok) {
          throw new Error('Haku ei onnistunut.')
        }

        const data = await response.json()
        setRequests(data)
        setStatus('success')
      } catch (fetchError) {
        setStatus('error')
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Haku ei onnistunut.',
        )
      }
    }

    fetchRequests()
  }, [])

  return (
    <section className="main">
      <div className="main__inner">
        <h1>YHTEYDENOTTOPYYNNÖT</h1>

        {status === 'loading' ? <p>Haetaan tietoja palvelimelta...</p> : null}
        {status === 'error' ? <p className="contact-form__error">{error}</p> : null}

        {status === 'success' && requests.length === 0 ? (
          <p>Lista on tyhjä.</p>
        ) : null}

        {requests.length > 0 ? (
          <div className="request-list">
            {requests.map((request) => (
              <article key={request.id} className="request-card">
                <h2>{request.name}</h2>
                <p>
                  <strong>Sähköposti:</strong> {request.email}
                </p>
                <p>
                  <strong>Puhelin:</strong> {request.phone}
                </p>
                <p>
                  <strong>Yhteydenottopäivä:</strong> {request.contact_date}
                </p>
                <p>
                  <strong>Viesti:</strong> {request.message}
                </p>
                <p>
                  <strong>Lähetetty:</strong>{request.created_at}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default ContactsList
