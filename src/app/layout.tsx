import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dify BaaS',
  description: 'Dify Backend as a Service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
