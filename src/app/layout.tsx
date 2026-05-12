import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: 'mrktr.club — Network with Marketing People Right',
  description: 'A private community where marketing students, alumni, and professionals can connect, share, and learn from each other.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body><AuthProvider>{children}</AuthProvider><Analytics /></body>
    </html>
  )
}
