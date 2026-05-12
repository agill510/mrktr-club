'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './ImageUploadEditor.module.css'

interface Props {
  imageUrl: string
  imagePosition: string
  imageZoom: number
  storagePath: string
  cardBackground: string
  aspectRatio: string
  fixedWidth?: number
  overlay?: React.ReactNode
  onChange: (patch: { imageUrl?: string; imagePosition?: string; imageZoom?: number }) => void
}

function parsePos(pos: string): [number, number] {
  const [x = '50', y = '50'] = pos.split(' ')
  return [parseFloat(x), parseFloat(y)]
}

export default function ImageUploadEditor({
  imageUrl, imagePosition, imageZoom, storagePath,
  cardBackground, aspectRatio, fixedWidth, overlay, onChange,
}: Props) {
  const [progress, setProgress] = useState(0)   // 0 = idle, 1-100 = uploading/done
  const [dragging, setDragging] = useState(false)
  const containerRef  = useRef<HTMLDivElement>(null)
  const fileRef       = useRef<HTMLInputElement>(null)
  const dragRef       = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null)
  const tickRef       = useRef<ReturnType<typeof setInterval> | null>(null)

  const [imgAspect, setImgAspect] = useState<number | null>(null)

  const imageUrlRef = useRef(imageUrl)
  useEffect(() => { imageUrlRef.current = imageUrl }, [imageUrl])

  // Detect image natural aspect ratio so we can compute proper cover-based sizing
  useEffect(() => {
    if (!imageUrl) { setImgAspect(null); return }
    const img = new Image()
    img.onload = () => setImgAspect(img.naturalWidth / img.naturalHeight)
    img.src = imageUrl
  }, [imageUrl])


  // Global drag tracking
  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = e.clientX - d.sx
      const dy = e.clientY - d.sy
      const sensitivity = 0.12 * (100 / imageZoom)
      const newX = Math.max(0, Math.min(100, d.px - dx * sensitivity))
      const newY = Math.max(0, Math.min(100, d.py - dy * sensitivity))
      onChange({ imagePosition: `${newX.toFixed(1)}% ${newY.toFixed(1)}%` })
    }
    const onUp = () => { setDragging(false); dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, onChange])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!imageUrl) return
    e.preventDefault()
    const [px, py] = parsePos(imagePosition)
    dragRef.current = { sx: e.clientX, sy: e.clientY, px, py }
    setDragging(true)
  }

  const startProgress = () => {
    setProgress(1)
    let cur = 1
    tickRef.current = setInterval(() => {
      // Ease toward 85% but never reach it — leaves room for the real completion jump
      cur += (85 - cur) * 0.06
      setProgress(Math.min(cur, 84))
    }, 80)
  }

  const finishProgress = (success: boolean) => {
    if (tickRef.current) clearInterval(tickRef.current)
    setProgress(success ? 100 : 0)
    if (success) setTimeout(() => setProgress(0), 700)
  }

  const upload = async (file: File) => {
    startProgress()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${storagePath}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('admin-media').upload(path, file, { upsert: true })
    if (error) {
      finishProgress(false)
      alert('Upload failed: ' + error.message)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('admin-media').getPublicUrl(path)
    onChange({ imageUrl: publicUrl, imagePosition: '50% 50%', imageZoom: 110 })
    finishProgress(true)
  }

  const uploading = progress > 0 && progress < 100

  // Compute cover-based background-size so the image always fills the preview.
  // coverPct = minimum width% that fills both dimensions given aspect ratios.
  // zoom then scales beyond that.
  const containerAspect = (() => {
    const [w, h] = aspectRatio.split('/').map(Number)
    return (w && h) ? w / h : 1
  })()
  const coverPct   = imgAspect ? Math.max(100, (imgAspect / containerAspect) * 100) : 100
  const bgSizePct  = imageUrl ? `${(coverPct * imageZoom) / 100}%` : undefined

  const containerStyle: React.CSSProperties = {
    background: cardBackground,
    aspectRatio,
    ...(fixedWidth ? { width: fixedWidth, flex: 'none' } : {}),
    ...(imageUrl ? {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: bgSizePct,
      backgroundPosition: imagePosition,
      backgroundRepeat: 'no-repeat',
    } : {}),
  }

  return (
    <div className={styles.wrap} style={fixedWidth ? { width: fixedWidth } : {}}>
      <div
        ref={containerRef}
        className={`${styles.card} ${dragging ? styles.grabbing : imageUrl ? styles.grab : ''}`}
        style={containerStyle}
        onMouseDown={onMouseDown}
      >
        {overlay}

        {/* Progress bar */}
        {progress > 0 && (
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressBar} ${progress === 100 ? styles.progressDone : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className={styles.hoverZone}>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={e => { e.stopPropagation(); fileRef.current?.click() }}
            disabled={uploading}
          >
            {uploading ? `Uploading ${Math.round(progress)}%…` : imageUrl ? '↑ Replace image' : '↑ Upload image'}
          </button>
          {imageUrl && !uploading && <p className={styles.hint}>Drag to reposition · Scroll to zoom</p>}
        </div>
      </div>

      {imageUrl && (
        <div className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            type="range" min={100} max={300} step={5} value={imageZoom}
            onChange={e => onChange({ imageZoom: +e.target.value })}
            className={styles.zoomSlider}
          />
          <span className={styles.zoomValue}>{imageZoom}%</span>
        </div>
      )}

      <input
        ref={fileRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { if (e.target.files?.[0]) upload(e.target.files[0]) }}
      />
    </div>
  )
}
