export default function Home() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">CancelaIA</a>
          <ul className="nav-links">
            <li><a href="#features">Funciones</a></li>
            <li><a href="#how">Como funciona</a></li>
            <li><a href="#pricing">Precios</a></li>
          </ul>
          <button className="nav-cta">Empezar gratis</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="container">
          <span className="hero-badge">Nuevo: Deteccion automatica de renovaciones</span>
          <h1>Deja de pagar por lo que no usas</h1>
          <p>CancelaIA escanea tus emails, detecta todas tus suscripciones activas y te permite cancelarlas con un solo clic. Ahorra hasta 200 euros al mes.</p>
          <div className="hero-buttons">
            <button className="btn-primary">Escanear mis suscripciones</button>
            <button className="btn-secondary">Ver demo</button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <div className="stat-number">847 euros</div>
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
          <div className="section-label">Funciones</div>
          <h2 className="section-title">Todo lo que necesitas para controlar tus gastos</h2>
          <p className="section-subtitle">Herramientas inteligentes que trabajan por ti las 24 horas del dia</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">&#x1F4E7;</div>
              <h3>Escaneo de emails</h3>
              <p>Conecta tu email y nuestro motor de IA detecta automaticamente todas las suscripciones activas, incluyendo las que habias olvidado.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x26A1;</div>
              <h3>Cancelacion con un clic</h3>
              <p>Sin formularios complicados ni llamadas telefonicas. Cancela cualquier suscripcion directamente desde nuestro panel en segundos.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1F4B0;</div>
              <h3>Monitor de gastos</h3>
              <p>Visualiza cuanto gastas al mes en suscripciones con graficos claros. Identifica donde puedes ahorrar mas dinero.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1F514;</div>
              <h3>Alertas de renovacion</h3>
              <p>Recibe notificaciones antes de que se renueve una suscripcion. Nunca mas te cobraran por algo que no quieres.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1F512;</div>
              <h3>100% Seguro</h3>
              <p>Tus datos estan cifrados de extremo a extremo. Nunca almacenamos credenciales ni accedemos a tu informacion personal.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">&#x1F4CA;</div>
              <h3>Informes mensuales</h3>
              <p>Recibe un resumen mensual con tu ahorro acumulado, nuevas suscripciones detectadas y recomendaciones personalizadas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-it-works">
        <div className="container">
          <div className="section-label">Como funciona</div>
          <h2 className="section-title">Tres pasos y listo</h2>
          <p className="section-subtitle">Empieza a ahorrar en menos de 2 minutos</p>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Conecta tu email</h3>
              <p>Vincula tu cuenta de correo de forma segura. Solo leemos los recibos y confirmaciones de suscripciones.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Revisa tus suscripciones</h3>
              <p>Te mostramos una lista completa con precios, fechas de renovacion y frecuencia de uso de cada servicio.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Cancela lo que sobra</h3>
              <p>Selecciona las que no quieres y nosotros nos encargamos del proceso de cancelacion automaticamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-label">Precios</div>
          <h2 className="section-title">Simple y transparente</h2>
          <p className="section-subtitle">Sin sorpresas. Cancela cuando quieras.</p>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>Gratis</h3>
              <div className="price">0 euros<span>/mes</span></div>
              <ul>
                <li>Escaneo basico de emails</li>
                <li>Hasta 5 suscripciones</li>
                <li>Alertas de renovacion</li>
                <li>Panel de control basico</li>
              </ul>
              <button className="pricing-btn">Empezar gratis</button>
            </div>
            <div className="pricing-card featured">
              <h3>Pro</h3>
              <div className="price">9.99 euros<span>/mes</span></div>
              <ul>
                <li>Escaneo ilimitado</li>
                <li>Suscripciones ilimitadas</li>
                <li>Cancelacion con un clic</li>
                <li>Informes mensuales</li>
                <li>Soporte prioritario</li>
              </ul>
              <button className="pricing-btn">Probar 14 dias gratis</button>
            </div>
            <div className="pricing-card">
              <h3>Empresa</h3>
              <div className="price">Contactar<span></span></div>
              <ul>
                <li>Todo lo de Pro</li>
                <li>Multi-usuario</li>
                <li>API de integracion</li>
                <li>Manager dedicado</li>
              </ul>
              <button className="pricing-btn">Contactar ventas</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <h2>Empieza a ahorrar hoy</h2>
          <p>Unete a miles de usuarios que ya han recuperado el control de sus suscripciones</p>
          <button className="btn-white">Crear cuenta gratis</button>
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
              <a href="#">Funciones</a>
              <a href="#">Precios</a>
              <a href="#">Seguridad</a>
              <a href="#">API</a>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <a href="#">Sobre nosotros</a>
              <a href="#">Blog</a>
              <a href="#">Empleo</a>
              <a href="#">Contacto</a>
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
