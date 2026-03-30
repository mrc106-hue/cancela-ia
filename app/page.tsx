'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
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
      {/* ═══ NAV ═══ */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">CancelaIA</Link>
          <ul className="nav-links">
            <li><a onClick={() => scrollTo('features')}>Funciones</a></li>
            <li><a onClick={() => scrollTo('how')}>Como funciona</a></li>
            <li><a onClick={() => scrollTo('pricing')}>Precios</a></li>
          </ul>
          <Link href="/login" className="nav-cta">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Entrar
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-orb-1" />
        <div className="hero-orb-2" />
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge hero-animate-1">
              <span className="hero-badge-dot" />
              IA de ultima generacion
            </div>
            <h1 className="hero-animate-2">
              Deja de pagar <br />
              por lo que <span className="gradient-text">no usas</span>
            </h1>
            <p className="hero-subtitle hero-animate-3">
              CancelaIA escanea tu correo con inteligencia artificial, detecta todas tus
              suscripciones activas y te permite cancelarlas al instante. Ahorra hasta 200€ al mes.
            </p>
            <div className="hero-buttons hero-animate-4">
              <Link href="/login" className="btn btn-primary btn-lg">
                Escanear mis suscripciones
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('how')}>
                Ver como funciona
              </button>
            </div>
            <div className="hero-stats hero-animate-5">
              <div>
                <div className="hero-stat-value">847€</div>
                <div className="hero-stat-label">Ahorro medio anual</div>
              </div>
              <div>
                <div className="hero-stat-value">12.5K+</div>
                <div className="hero-stat-label">Usuarios activos</div>
              </div>
              <div>
                <div className="hero-stat-value">30s</div>
                <div className="hero-stat-label">Cancelacion media</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-mockup">
              <div style={{ padding: '20px', background: 'var(--bg-elevated)' }}>
                {/* Simulated dashboard header */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                </div>
                {/* Simulated subscription list */}
                {[
                  { name: 'Netflix', price: '15.99€', color: '#E50914', status: 'active' },
                  { name: 'Spotify', price: '9.99€', color: '#1DB954', status: 'active' },
                  { name: 'Adobe CC', price: '59.99€', color: '#FF0000', status: 'cancelled' },
                  { name: 'ChatGPT', price: '20.00€', color: '#10A37F', status: 'active' },
                  { name: 'Figma', price: '12.00€', color: '#A259FF', status: 'cancelled' },
                ].map((sub, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', marginBottom: 8,
                    background: 'var(--bg-card)', borderRadius: 10,
                    border: '1px solid var(--border)',
                    opacity: sub.status === 'cancelled' ? 0.5 : 1,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: `${sub.color}20`, color: sub.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700,
                    }}>
                      {sub.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {sub.status === 'cancelled' ? 'Cancelada' : 'Activa'}
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Space Grotesk' }}>
                      {sub.price}
                    </div>
                    {sub.status === 'cancelled' ? (
                      <div style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'rgba(16,185,129,0.1)', color: '#10B981',
                        fontSize: 10, fontWeight: 600,
                      }}>AHORRADO</div>
                    ) : (
                      <div style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: 'rgba(244,63,94,0.1)', color: '#F43F5E',
                        fontSize: 10, fontWeight: 600, cursor: 'pointer',
                      }}>CANCELAR</div>
                    )}
                  </div>
                ))}
                {/* Savings summary */}
                <div style={{
                  marginTop: 16, padding: '14px 16px', borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))',
                  border: '1px solid rgba(124,58,237,0.2)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Ahorro mensual</div>
                  <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Space Grotesk', color: '#10B981' }}>+71.99€</div>
                </div>
              </div>
              <div className="hero-mockup-overlay" />
            </div>

            {/* Floating cards */}
            <div className="hero-float-card card-1">
              <div className="hero-float-icon green">✓</div>
              <div>
                <div className="hero-float-title">Adobe cancelada</div>
                <div className="hero-float-sub">Ahorro: 59.99€/mes</div>
              </div>
            </div>
            <div className="hero-float-card card-2">
              <div className="hero-float-icon blue">🔍</div>
              <div>
                <div className="hero-float-title">8 suscripciones</div>
                <div className="hero-float-sub">Detectadas por IA</div>
              </div>
            </div>
            <div className="hero-float-card card-3">
              <div className="hero-float-icon red">⚠</div>
              <div>
                <div className="hero-float-title">Renovacion en 3 dias</div>
                <div className="hero-float-sub">Spotify Premium</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BRANDS ═══ */}
      <section className="brands reveal">
        <div className="container">
          <div className="brands-title">Detectamos suscripciones de mas de 500 servicios</div>
          <div className="brands-grid">
            {['Netflix', 'Spotify', 'Amazon', 'Disney+', 'Adobe', 'Apple', 'Google', 'Microsoft'].map(b => (
              <span key={b}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="section section-elevated">
        <div className="container">
          <div className="section-label reveal">
            <span className="section-label-dot" /> Funciones
          </div>
          <h2 className="section-title reveal">Todo el control sobre tus gastos recurrentes</h2>
          <p className="section-subtitle reveal">
            Herramientas inteligentes que trabajan 24/7 para que nunca pagues de mas
          </p>
          <div className="features-grid">
            {[
              {
                icon: '📧', iconClass: '', title: 'Escaneo inteligente de email',
                desc: 'Conecta tu correo y nuestra IA detecta automaticamente todas las suscripciones, incluyendo las que habias olvidado.',
              },
              {
                icon: '⚡', iconClass: 'cyan', title: 'Cancelacion instantanea',
                desc: 'Sin formularios ni llamadas. Cancela cualquier suscripcion directamente desde el panel en un solo clic.',
              },
              {
                icon: '📊', iconClass: 'green', title: 'Monitor de gastos en tiempo real',
                desc: 'Visualiza cuanto gastas al mes con graficos interactivos. Identifica donde puedes ahorrar mas.',
              },
              {
                icon: '🔔', iconClass: 'amber', title: 'Alertas de renovacion',
                desc: 'Recibe notificaciones antes de que se renueven. Nunca mas te cobraran por algo que no quieres.',
              },
              {
                icon: '🔒', iconClass: 'rose', title: 'Seguridad de grado bancario',
                desc: 'Cifrado de extremo a extremo. Solo leemos recibos de suscripciones, nunca tu informacion personal.',
              },
              {
                icon: '🤖', iconClass: '', title: 'Recomendaciones con IA',
                desc: 'Analisis inteligente de tus patrones de uso. Te sugerimos que cancelar basandonos en datos reales.',
              },
            ].map((f, i) => (
              <div key={i} className={`card feature-card feature-card-enhanced reveal reveal-delay-${i + 1}`}>
                <div className={`feature-icon-wrap feature-icon-large ${f.iconClass}`}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="section section-dark">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div className="section-label reveal">
                <span className="section-label-dot" /> Como funciona
              </div>
              <h2 className="section-title reveal">Tres pasos y empieza a ahorrar</h2>
              <p className="section-subtitle reveal">
                En menos de 2 minutos tendras el control total sobre tus suscripciones
              </p>
              <div className="steps-grid reveal">
                <div className="steps-line" />
                {[
                  {
                    num: '01', title: 'Conecta tu email',
                    desc: 'Vincula tu cuenta de Google de forma segura. Solo accedemos a recibos y confirmaciones de suscripciones.',
                  },
                  {
                    num: '02', title: 'Revisa tus suscripciones',
                    desc: 'Nuestra IA analiza miles de emails en segundos y te muestra una lista completa con precios y frecuencia de uso.',
                  },
                  {
                    num: '03', title: 'Cancela lo que sobra',
                    desc: 'Selecciona las que no quieres y nosotros nos encargamos del proceso de cancelacion automaticamente.',
                  },
                ].map((s, i) => (
                  <div key={i} className="step-item">
                    <div className="step-number">{s.num}</div>
                    <div className="step-content">
                      <h3>{s.title}</h3>
                      <p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal" style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Scan animation mockup */}
              <div className="scan-container" style={{ maxWidth: 400, width: '100%' }}>
                <div className="scan-line active" />
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                    background: 'var(--primary-soft)', border: '2px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                  }}>📧</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.2rem' }}>
                    Escaneando emails...
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                    Analizando 2,847 emails
                  </div>
                </div>
                {/* Progress items */}
                {[
                  { name: 'Netflix', status: 'found', price: '15.99€' },
                  { name: 'Spotify Premium', status: 'found', price: '9.99€' },
                  { name: 'Adobe Creative Cloud', status: 'found', price: '59.99€' },
                  { name: 'Amazon Prime', status: 'scanning', price: '...' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', marginTop: 8,
                    background: item.status === 'found' ? 'rgba(16,185,129,0.05)' : 'rgba(124,58,237,0.05)',
                    border: `1px solid ${item.status === 'found' ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)'}`,
                    borderRadius: 10,
                    animation: item.status === 'scanning' ? 'pulse-glow 2s infinite' : 'none',
                  }}>
                    <div style={{ fontSize: 16 }}>
                      {item.status === 'found' ? '✅' : '🔍'}
                    </div>
                    <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 700, fontFamily: 'Space Grotesk',
                      color: item.status === 'found' ? 'var(--success)' : 'var(--primary)',
                    }}>{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="section section-elevated">
        <div className="container">
          <div className="stats-grid reveal">
            {[
              { value: '847€', label: 'Ahorro medio anual', color: 'green' },
              { value: '12.5K+', label: 'Usuarios activos', color: 'purple' },
              { value: '98%', label: 'Tasa de exito', color: 'cyan' },
              { value: '30 seg', label: 'Cancelacion media', color: 'amber' },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-value ${s.color}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="section section-dark">
        <div className="container">
          <div className="section-label center reveal" style={{ textAlign: 'center' }}>
            <span className="section-label-dot" /> Precios
          </div>
          <h2 className="section-title center reveal">Simple y transparente</h2>
          <p className="section-subtitle center reveal">Sin sorpresas ni compromisos. Cancela cuando quieras.</p>
          <div className="pricing-grid">
            {[
              {
                name: 'Gratis', price: '0€', period: '/mes', featured: false,
                features: ['Escaneo basico', 'Hasta 5 suscripciones', 'Alertas de renovacion', 'Panel basico'],
                cta: 'Empezar gratis',
              },
              {
                name: 'Pro', price: '9.99€', period: '/mes', featured: true,
                features: ['Escaneo ilimitado', 'Suscripciones ilimitadas', 'Cancelacion con un clic', 'Informes mensuales', 'Soporte prioritario', 'Recomendaciones IA'],
                cta: 'Probar 14 dias gratis',
              },
              {
                name: 'Premium', price: '19.99€', period: '/mes', featured: false,
                features: ['Todo lo de Pro', 'Multi-cuenta (3 emails)', 'API de integracion', 'Manager dedicado', 'SLA 99.9%'],
                cta: 'Contactar ventas',
              },
            ].map((plan, i) => (
              <div key={i} className={`card pricing-card reveal reveal-delay-${i + 1} ${plan.featured ? 'featured pricing-recommended' : ''}`}>
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  {plan.price}<span>{plan.period}</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f, j) => (
                    <li key={j}><span className="pricing-check">✓</span> {f}</li>
                  ))}
                </ul>
                <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIOS ═══ */}
      <section className="section section-elevated" id="testimonials">
        <div className="container">
          <div className="section-label center reveal" style={{ textAlign: 'center' }}>
            <span className="section-label-dot" /> Testimonios
          </div>
          <h2 className="section-title center reveal">
            Lo que dicen nuestros <span className="gradient-text">usuarios</span>
          </h2>
          <p className="section-subtitle center reveal">
            Más de 12.500 personas ya han recuperado el control de sus suscripciones
          </p>
          <div className="testimonials-grid">
            {/* Testimonio 1 */}
            <div className="testimonial-card reveal reveal-delay-1">
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(s => <span key={s} className="testimonial-star">★</span>)}
              </div>
              <p className="testimonial-text">
                &ldquo;Increíble. En menos de 2 minutos CancelaIA detectó 6 suscripciones que tenía olvidadas.
                Cancelé 4 de ellas y ahorro más de 80€ al mes. Ojalá lo hubiera descubierto antes.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">M</div>
                <div>
                  <div className="testimonial-name">María González</div>
                  <div className="testimonial-role">Diseñadora freelance, Madrid</div>
                </div>
              </div>
              <div className="testimonial-savings">💚 Ahorro mensual: +82€/mes</div>
            </div>

            {/* Testimonio 2 */}
            <div className="testimonial-card reveal reveal-delay-2">
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(s => <span key={s} className="testimonial-star">★</span>)}
              </div>
              <p className="testimonial-text">
                &ldquo;Llevaba años pagando por Adobe Creative Cloud sin usarlo. CancelaIA lo detectó
                automáticamente y gestionó la cancelación por mí. El proceso fue rapidísimo y sin complicaciones.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{background: 'linear-gradient(135deg, #EC4899, #7C3AED)'}}>C</div>
                <div>
                  <div className="testimonial-name">Carlos Martínez</div>
                  <div className="testimonial-role">Emprendedor, Barcelona</div>
                </div>
              </div>
              <div className="testimonial-savings">💚 Ahorro mensual: +59€/mes</div>
            </div>

            {/* Testimonio 3 */}
            <div className="testimonial-card reveal reveal-delay-3">
              <div className="testimonial-stars">
                {[1,2,3,4,5].map(s => <span key={s} className="testimonial-star">★</span>)}
              </div>
              <p className="testimonial-text">
                &ldquo;Me parecía imposible que una IA pudiera gestionar mis suscripciones mejor que yo.
                Estaba equivocada. CancelaIA encontró 9 servicios activos y me ayudó a limpiar todo en un día.&rdquo;
              </p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{background: 'linear-gradient(135deg, #06B6D4, #10B981)'}}>L</div>
                <div>
                  <div className="testimonial-name">Laura Sánchez</div>
                  <div className="testimonial-role">Profesora universitaria, Valencia</div>
                </div>
              </div>
              <div className="testimonial-savings">💚 Ahorro mensual: +134€/mes</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <div className="cta-orb" />
        <div className="container reveal" style={{ position: 'relative' }}>
          <h2>Empieza a ahorrar hoy</h2>
          <p>Unete a miles de usuarios que ya han recuperado el control de sus gastos recurrentes</p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Crear cuenta gratis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Link href="/" className="nav-logo" style={{ fontSize: '1.3rem' }}>CancelaIA</Link>
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
              <a href="mailto:mrc106@gmail.com">Contacto</a>
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
            © 2024 CancelaIA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  )
}
