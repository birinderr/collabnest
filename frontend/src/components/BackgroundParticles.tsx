import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

const REPEL_RADIUS   = 110;
const REPEL_STRENGTH = 5;
const RETURN_SPEED   = 0.055;
const DAMPING        = 0.78;
const DOT_COLOR      = '148, 163, 184'; // slate-400
const GRID_SPACING   = 28;              // matches original CSS grid

export default function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let rafId: number;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function buildParticles(w: number, h: number) {
      particles = [];
      const cols = Math.ceil(w / GRID_SPACING) + 2;
      const rows = Math.ceil(h / GRID_SPACING) + 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Tiny jitter so the grid feels organic, not mechanical
          const jx = (Math.random() - 0.5) * 5;
          const jy = (Math.random() - 0.5) * 5;
          const x = col * GRID_SPACING + jx;
          const y = row * GRID_SPACING + jy;
          particles.push({
            x, y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
            radius: Math.random() * 0.75 + 0.5,
            opacity: Math.random() * 0.22 + 0.07,
          });
        }
      }
    }

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      buildParticles(canvas.width, canvas.height);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        const dx   = mouse.x - p.x;
        const dy   = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx -= (dx / dist) * force * REPEL_STRENGTH;
          p.vy -= (dy / dist) * force * REPEL_STRENGTH;
        }

        // Spring return to origin
        p.vx += (p.originX - p.x) * RETURN_SPEED;
        p.vy += (p.originY - p.y) * RETURN_SPEED;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x  += p.vx;
        p.y  += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${DOT_COLOR}, ${p.opacity})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    const onMouseMove  = (e: MouseEvent) => { mouse = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = ()               => { mouse = { x: -9999,    y: -9999    }; };
    const onResize     = ()               => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 120); };

    resize();
    draw();

    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize',     onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize',     onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    />
  );
}
