import React, { useEffect, useRef } from 'react'

const ParticleField = ({ className = '', density = 60 }) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const accent = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-accent-primary')
            .trim() || '#8b7cf6'

        const toRgb = (hex) => {
            let h = hex.replace('#', '')
            if (h.length === 3) h = h.split('').map((c) => c + c).join('')
            const num = parseInt(h, 16)
            return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
        }
        const [r, g, b] = toRgb(accent)

        let width, height, particles

        const resize = () => {
            width = canvas.width = canvas.offsetWidth
            height = canvas.height = canvas.offsetHeight
        }
        resize()
        window.addEventListener('resize', resize)

        const count = Math.min(density, Math.floor((width * height) / 18000))
        particles = Array.from({ length: count }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.6,
        }))

        if (reduceMotion) {
            ctx.clearRect(0, 0, width, height)
            particles.forEach((p) => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${r},${g},${b},0.35)`
                ctx.fill()
            })
            return () => window.removeEventListener('resize', resize)
        }

        let frameId
        const draw = () => {
            ctx.clearRect(0, 0, width, height)
            particles.forEach((p) => {
                p.x += p.vx
                p.y += p.vy
                if (p.x < 0 || p.x > width) p.vx *= -1
                if (p.y < 0 || p.y > height) p.vy *= -1
            })
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x
                    const dy = particles[i].y - particles[j].y
                    const dist = Math.hypot(dx, dy)
                    if (dist < 120) {
                        ctx.strokeStyle = `rgba(${r},${g},${b},${0.12 * (1 - dist / 120)})`
                        ctx.lineWidth = 0.6
                        ctx.beginPath()
                        ctx.moveTo(particles[i].x, particles[i].y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }
            }
            particles.forEach((p) => {
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(${r},${g},${b},0.55)`
                ctx.fill()
            })
            frameId = requestAnimationFrame(draw)
        }
        draw()

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener('resize', resize)
        }
    }, [density])

    return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} />
}

export default ParticleField