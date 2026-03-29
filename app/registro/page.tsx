'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Registro() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name && email) setSubmitted(true)
  }

  return (
    <div className="registro-page">
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">CancelaIA</Link>
          <Link href="/" className="nav-back">&larr; Volver</Link>
        </div>
      </nav>

      <section className="registro-section">
        <div className="container">
          {!submitted ? (
            <div className="registro-card reveal">
              <div className="registro-badge">Acceso anticipado</div>
              <h1>Empieza a ahorrar hoy</h1>
              <p>Crea tu cuenta gratuita y descubre cuanto puedes ahorrar en suscripciones</p>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Crear cuenta gratis
                </button>
              </form>
              <p className="registro-terms">
                Al registrarte aceptas nuestros <a href="#">Terminos</a> y <a href="#">Politica de privacidad</a>
              </p>
            </div>
          ) : (
            <div className="registro-card registro-success reveal">
              <div className="success-icon">&#x2713;</div>
              <h1>Bienvenido, {name}!</h1>
              <p>Te hemos enviado un email a <strong>{email}</strong> con los proximos pasos para conectar tu cuenta de correo y empezar a ahorrar.</p>
              <Link href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                Volver al inicio
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
