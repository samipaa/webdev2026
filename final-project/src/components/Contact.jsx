import { useState } from 'react'
import { z } from 'zod'

import FormResponse from './FormResponse'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nimi on pakollinen.'),
  email: z.string().trim().email('Anna toimiva sähköpostiosoite.'),
  phone: z.string().trim()
    .min(10, 'Puhelinnumeron tulee olla muodossa 0501234567.')
    .regex(/^[0-9]*$/, 'Puhelinnumeron tulee sisältää vain numeroita.'),
  date: z.string().min(1, 'Valitse päivämäärä.'),
  message: z.string().trim().min(10, 'Kirjoita vähintään 10 merkkiä.'),
})

const initForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  message: '',
}

function Contact() {
  const [formValues, setFormValues] = useState(initForm)
  const [errors, setErrors] = useState({})
  const [submitState, setSubmitState] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [responseData, setResponseData] = useState(null)

  function onChange(event) {
    const { name, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }))

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
  }

  async function onSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const validationResult = contactSchema.safeParse(formValues)

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors

      setErrors({
        name: fieldErrors.name?.[0] ?? '',
        email: fieldErrors.email?.[0] ?? '',
        phone: fieldErrors.phone?.[0] ?? '',
        date: fieldErrors.date?.[0] ?? '',
        message: fieldErrors.message?.[0] ?? '',
      })
      setSubmitState('error')
      return
    }

    setErrors({})
    setSubmitState('submitting')

    try {
      const requestBody = { ...validationResult.data, submittedAt: new Date().toISOString(), }

      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Virhe. Yritä uudelleen.')
      }

      const result = await response.json()

      setResponseData({
        url: result.url,
        origin: result.origin,
        json: result.json,
        headers: result.headers,
      })
      setSubmitState('success')
      setFormValues(initForm)
    } catch (error) {
      setSubmitState('error')
      setSubmitError(
        error instanceof Error
        ? error.message
        : 'Lähetys ei onnistunut. Yritä uudelleen.',
      )
    }
  }

  return (
    <section className="main">
      <div>
        <h1>YHTEYSTIEDOT</h1>
        <p className="form-page__intro">
          Lähetä yhteydenottopyyntö lomakkeella.
        </p>

        <form className="contact-form" onSubmit={onSubmit} noValidate>
          <div className="contact-form__field">
            <label htmlFor="name">Nimi</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={onChange}
              placeholder=""
              autoComplete="name"
            />
            {errors.name ? <p className="contact-form__error">{errors.name}</p> : null}
          </div>

          <div className="contact-form__field">
            <label htmlFor="email">Sähkoposti</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={onChange}
              placeholder=""
              autoComplete="email"
            />
            {errors.email ? <p className="contact-form__error">{errors.email}</p> : null}
          </div>

          <div className="contact-form__field">
            <label htmlFor="phone">Puhelin</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formValues.phone}
              onChange={onChange}
              placeholder="0501234567"
              autoComplete="tel"
            />
            {errors.phone ? <p className="contact-form__error">{errors.phone}</p> : null}
          </div>

          <div className="contact-form__field">
            <label htmlFor="date">Yhteydenottopäivä</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formValues.date}
              onChange={onChange}
            />
            {errors.date ? (
              <p className="contact-form__error">{errors.date}</p>
            ) : null}
          </div>

          <div className="contact-form__field">
            <label htmlFor="message">Viesti</label>
            <textarea
              id="message"
              name="message"
              rows="6"
              value={formValues.message}
              onChange={onChange}
              placeholder="Kerro, mihin tarvitset apua."/>
            {errors.message ? (
              <p className="contact-form__error">{errors.message}</p>
            ) : null}
          </div>

          <div>
            <button type="submit" disabled={submitState === 'submitting'}>
              {submitState === 'submitting' ? 'Lähetetään...' : 'Lähetä yhteydenottopyyntö'}
            </button>
            {submitState === 'success' ? (
              <p className="contact-form__status">Lähetys onnistui.</p>
            ) : null}
            {submitError ? <p className="contact-form__error">{submitError}</p> : null}
          </div>
        </form>

        <FormResponse response={responseData} />
      </div>
    </section>
  )
}

export default Contact