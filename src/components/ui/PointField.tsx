import { useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/useTheme'

type Point = { x: number; y: number; vx: number; vy: number }

const LINK_DISTANCE = 130

/**
 * Drifting point cloud with proximity links — a quiet nod to the 3D sensor
 * data behind the work. Static single frame when reduced motion is on.
 */
export default function PointField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let frame = 0
    const points: Point[] = []

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      points.length = 0
      const count = Math.max(18, Math.min(64, Math.round((width * height) / 16000)))
      for (let i = 0; i < count; i += 1) {
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = accent
      ctx.lineWidth = 1

      for (let i = 0; i < points.length; i += 1) {
        const p = points[i]
        for (let j = i + 1; j < points.length; j += 1) {
          const q = points[j]
          const dx = p.x - q.x
          const dy = p.y - q.y
          const distance = Math.hypot(dx, dy)
          if (distance >= LINK_DISTANCE) continue
          ctx.globalAlpha = (1 - distance / LINK_DISTANCE) * 0.22
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.stroke()
        }
      }

      ctx.globalAlpha = 0.55
      ctx.fillStyle = accent
      for (const p of points) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const tick = () => {
      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        if (p.x <= 0 || p.x >= width) p.vx *= -1
        if (p.y <= 0 || p.y >= height) p.vy *= -1
      }
      draw()
      frame = requestAnimationFrame(tick)
    }

    const restart = () => {
      resize()
      seed()
      draw()
    }

    restart()
    if (!reduced) frame = requestAnimationFrame(tick)

    // The hero grows as fonts and the portrait load, so watch the element
    // itself rather than just the window.
    const observer = new ResizeObserver(restart)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [theme])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
