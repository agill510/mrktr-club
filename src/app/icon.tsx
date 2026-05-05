import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0c0f18',
          fontFamily: 'sans-serif',
          fontWeight: 800,
          fontSize: 21,
          color: 'white',
          letterSpacing: '-0.5px',
        }}
      >
        m
      </div>
    ),
    { ...size }
  )
}
