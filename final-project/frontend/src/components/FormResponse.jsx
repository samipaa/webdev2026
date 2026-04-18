function FormResponse({ response }) {
  if (!response) {
    return null
  }

  return (
    <section className="response-card">
      <h2>Vastaus</h2>
      <p>
        Lomakkeen lähetys onnistui.
      </p>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </section>
  )
}

export default FormResponse