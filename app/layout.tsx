import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CancelaIA - Gestor Inteligente de Suscripciones',
  description: 'Escanea tus emails, detecta suscripciones activas y cancela con un clic. Ahorra dinero sin esfuerzo con inteligencia artificial.',
  keywords: ['cancelar suscripciones', 'gestionar suscripciones', 'ahorrar dinero', 'IA', 'email scanner'],
  openGraph: {
    title: 'CancelaIA - Deja de pagar por lo que no usas',
    description: 'Detecta y cancela suscripciones innecesarias con IA. Ahorra hasta 200€ al mes.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}
