'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">CancelaIA</a>
          <ul className="nav-links">
            <li><a href="#features" onClick={e => { e.preventDefault(); scrollTo('features') }}>Funciones</a></li>
            <li><a href="#how" onClick={e => { e.preventDefault(); scrollTo('how') }}>Como funciona</a></li>
            <li><a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('pricing') }}>Precios</a></li>
          </ul>
          <Link href="/registro" className="nav-cta">Empezar gratis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-text">
            <span className="hero-badge">Nuevo: Deteccion automatica de renovaciones</span>
            <h1>Deja de pagar por lo que no usas</h1>
            <p>CancelaIA escanea tus emails, detecta todas tus suscripciones activas y te permite cancelarlas con un solo clic. Ahorra hasta 200 euros al mes.</p>
            <div className="hero-buttons">
              <Link href="/registro" className="btn-primary">Escanear mis suscripciones</Link>
              <button className="btn-secondary" onClick={() => scrollTo('how')}>Ver demo</button>
            </div>
          </div>
          <div className="hero-image reveal">
            <Image
              src="/images/hero-dashboard.jpg"
              alt="Dashboard CancelaIA mostrando suscripciones"
              width={600}
              height={400}
              priority
              style={{ borderRadius: '16px', boxShadow: '0 20px 60px rgba(108,58,255,0.3)' }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal">
        <div className="stat">
          <div className="stat-number">847&euro;</div>
          <div className="stat-label">Ahorro medio anual</div>
        </div>
        <div className="stat">
          <div className="stat-number">12.5K+</div>
          <div className="stat-label">Usuarios activos</div>
        </div>
        <div className="stat">
          <div className="stat-number">98%</div>
          <div className="stat-label">Tasa de cancelacion exitosa</div>
        </div>
        <div className="stat">
          <div className="stat-number">30 seg</div>
          <div className="stat-label">Tiempo medio de cancelacion</div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-label reveal">Funciones</div>
          <h2 className="section-title reveal">Todo lo que necesitas para controlar tus gastos</h2>
          <p className="section-subtitle reveal">Herramientas inteligentes que trabajan por ti las 24 horas del dia</p>
          <div className="features-grid">
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3>Escaneo de emails</h3>
              <p>Conecta tu email y nuestro motor de IA detecta automaticamente todas las suscripciones activas, incluyendo las que habias olvidado.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3>Cancelacion con un clic</h3>
              <p>Sin formularios complicados ni llamadas telefonicas. Cancela cualquier suscripcion directamente desde nuestro panel en segundos.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Monitor de gastos</h3>
              <p>Visualiza cuanto gastas al mes en suscripciones con graficos claros. Identifica donde puedes ahorrar mas dinero.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              </div>
              <h3>Alertas de renovacion</h3>
              <p>Recibe notificaciones antes de que se renueve una suscripcion. Nunca mas te cobraran por algo que no quieres.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3>100% Seguro</h3>
              <p>Tus datos estan cifrados de extremo a extremo. Nunca almacenamos credenciales ni accedemos a tu informacion personal.</p>
            </div>
            <div className="feature-card reveal">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6C3AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              </div>
              <h3>Informes mensuales</h3>
              <p>Recibe un resumen mensual con tu ahorro acumulado, nuevas suscripciones detectadas y recomendaciones personalizadas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-it-works">
        <div className="container">
          <div className="section-label reveal">Como funciona</div>
          <h2 className="section-title reveal">Tres pasos y listo</h2>
          <p className="section-subtitle reveal">Empieza a ahorrar en menos de 2 minutos</p>
          <div className="how-grid">
            <div className="steps">
              <div className="step reveal">
                <div className="step-number">1</div>
                <div>
                  <h3>Conecta tu email</h3>
                  <p>Vincula tu cuenta de correo de forma segura. Solo leemos los recibos y confirmaciones de suscripciones.</p>
                </div>
              </div>
              <div className="step reveal">
                <div className="step-number">2</div>
                <div>
                  <h3>Revisa tus suscripciones</h3>
                  <p>Te mostramos una lista completa con precios, fechas de renovacion y frecuencia de uso de cada servicio.</p>
                </div>
              </div>
              <div className="step reveal">
                <div className="step-number">3</div>
                <div>
                  <h3>Cancela lo que sobra</h3>
                  <p>Selecciona las que no quieres y nosotros nos encargamos del proceso de cancelacion automaticamente.</p>
                </div>
              </div>
            </div>
            <div className="how-image reveal">
              <Image
                src="/images/how-it-works.jpg"
                alt="Como funciona CancelaIA"
                width={550}
                height={400}
                style={{ borderRadius: '16px', boxShadow: '0 16px 48px rgba(108,58,255,0.2)' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-label reveal">Precios</div>
          <h2 className="section-title reveal">Simple y transparente</h2>
          <p className="section-subtitle reveal">Sin sorpresas. Cancela cuando quieras.</p>
          <div className="pricing-cards">
            <div className="pricing-card reveal">
              <h3>Gratis</h3>
              <div className="price">0&euro;<span>/mes</span></div>
              <ul>
                <li>Escaneo basico de emails</li>
                <li>Hasta 5 suscripciones</li>
                <li>Alertas de renovacion</li>
                <li>Panel de control basico</li>
              </ul>
              <Link href="/registro" className="pricing-btn">Empezar gratis</Link>
            </div>
            <div className="pricing-card featured reveal">
              <h3>Pro</h3>
              <div className="price">9.99&euro;<span>/mes</span></div>
              <ul>
                <li>Escaneo ilimitado</li>
                <li>Suscripciones ilimitadas</li>
                <li>Cancelacion con un clic</li>
                <li>Informes mensuales</li>
                <li>Soporte prioritario</li>
              </ul>
              <Link href="/registro" className="pricing-btn">Probar 14 dias gratis</Link>
            </div>
            <div className="pricing-card reveal">
              <h3>Empresa</h3>
              <div className="price">Contactar<span></span></div>
              <ul>
                <li>Todo lo de Pro</li>
                <li>Multi-usuario</li>
                <li>API de integracion</li>
                <li>Manager dedicado</li>
              </ul>
              <a href="mailto:contacto@cancelaia.com" className="pricing-btn">Contactar ventas</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container reveal">
          <h2>Empieza a ahorrar hoy</h2>
          <p>Unete a miles de usuarios que ya han recuperado el control de sus suscripciones</p>
          <Link href="/registro" className="btn-white">Crear cuenta gratis</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <h3>CancelaIA</h3>
              <p>El gestor inteligente de suscripciones que te ayuda a ahorrar dinero sin esfuerzo.</p>
            </div>
            <div className="footer-col">
              <h4>Producto</h4>
              <a href="#features" onClick={e => { e.preventDefault(); scrollTo('features') }}>Funciones</a>
              <a href="#pricing" onClick={e => { e.preventDefault(); scrollTo('pricing') }}>Precios</a>
              <a href="#features" onClick={e => { e.preventDefault(); scrollTo('features') }}>Seguridad</a>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <a href="mailto:contacto@cancelaia.com">Contacto</a>
              <a href="#">Sobre nosotros</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacidad</a>
              <a href="#">Terminos</a>
              <a href="#">Cookies</a>
            </div>
          </div>
          <div className="footer-bottom">
            2024 CancelaIA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  )
}
