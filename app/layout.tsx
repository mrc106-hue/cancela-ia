import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CancelaIA - Gestor Inteligente de Suscripciones',
  description: 'Escanea tus emails, detecta suscripciones activas y cancela con un clic. Ahorra dinero sin esfuerzo.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
