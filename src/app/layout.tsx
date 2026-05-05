import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
})

export const metadata: Metadata = {
  title: 'mrkt.ee — Network with Marketing People',
  description: 'A private community where marketing students, alumni, and professionals can connect, share, and learn from each other.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>{children}</body>
    </html>
  )
}
