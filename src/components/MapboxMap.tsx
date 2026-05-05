'use client'

import { useEffect, useRef } from 'react'
import styles from './MapboxMap.module.css'

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ''

const MARKERS = [
  { emoji: '📍', label: 'San Francisco', coords: [-122.4194, 37.7749] as [number, number] },
  { emoji: '📍', label: 'Oakland',       coords: [-122.2712, 37.8044] as [number, number] },
  { emoji: '📍', label: 'Hayward',       coords: [-122.0808, 37.6688] as [number, number] },
  { emoji: '📍', label: 'Fremont',       coords: [-121.9886, 37.5485] as [number, number] },
  { emoji: '🎓', label: 'UC Berkeley',   coords: [-122.2595, 37.8724] as [number, number] },
  { emoji: '🎓', label: 'Stanford',      coords: [-122.1697, 37.4275] as [number, number] },
  { emoji: '🎓', label: 'SJSU',          coords: [-121.8819, 37.3352] as [number, number] },
  { emoji: '🏢', label: 'Stripe',        coords: [-122.3990, 37.7821] as [number, number] },
  { emoji: '🏢', label: 'Oracle',        coords: [-122.2605, 37.5296] as [number, number] },
  { emoji: '🏢', label: 'Meta',          coords: [-122.1817, 37.4848] as [number, number] },
  { emoji: '🏢', label: 'Google',        coords: [-122.0840, 37.3861] as [number, number] },
  { emoji: '🏢', label: 'Apple',         coords: [-122.0090, 37.3346] as [number, number] },
]

export default function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    let map: ReturnType<typeof import('mapbox-gl')['default']['prototype']['constructor']> | null = null

    const init = async () => {
      const mapboxgl = (await import('mapbox-gl')).default
      mapboxgl.accessToken = TOKEN

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = new (mapboxgl as any).Map({
        container: containerRef.current!,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [-122.2, 37.60],
        zoom: 9,
        attributionControl: false,
        logoPosition: 'bottom-right',
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m.addControl(new (mapboxgl as any).AttributionControl({ compact: true }), 'bottom-right')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      m.on('load', () => {
        // Hide text labels but keep icons/colors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        m.getStyle().layers.forEach((layer: any) => {
          if (layer.type === 'symbol') {
            m.setLayoutProperty(layer.id, 'text-field', '')
          }
        })

        MARKERS.forEach(({ emoji, label, coords }) => {
          const el = document.createElement('div')
          el.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;cursor:default;'

          const emojiEl = document.createElement('span')
          emojiEl.textContent = emoji
          emojiEl.style.cssText = 'font-size:22px;line-height:1;filter:drop-shadow(0 2px 5px rgba(0,0,0,0.35));'

          const labelEl = document.createElement('span')
          labelEl.textContent = label
          labelEl.style.cssText = [
            'font-size:10px',
            'font-weight:700',
            'color:#fff',
            'background:rgba(13,15,18,0.68)',
            'padding:2px 8px',
            'border-radius:20px',
            'white-space:nowrap',
            'letter-spacing:0.2px',
          ].join(';')

          el.appendChild(emojiEl)
          el.appendChild(labelEl)

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new (mapboxgl as any).Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .addTo(m)
        })
      })

      map = m
    }

    init()
    return () => { map?.remove() }
  }, [])

  return <div ref={containerRef} className={styles.map} />
}
