import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const lines: { x1: number; y1: number; x2: number; y2: number; progress: number; alpha: number }[] = [];

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: Math.random() > 0.7 ? '#dc2626' : '#2563eb',
      });
    }

    // Create blueprint lines
    for (let i = 0; i < 8; i++) {
      const isHorizontal = Math.random() > 0.5;
      lines.push({
        x1: isHorizontal ? 0 : Math.random() * w,
        y1: isHorizontal ? Math.random() * h : 0,
        x2: isHorizontal ? w : Math.random() * w,
        y2: isHorizontal ? Math.random() * h : h,
        progress: 0,
        alpha: Math.random() * 0.06 + 0.02,
      });
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw blueprint lines
      lines.forEach(line => {
        if (line.progress < 1) line.progress += 0.002;
        const endX = line.x1 + (line.x2 - line.x1) * line.progress;
        const endY = line.y1 + (line.y2 - line.y1) * line.progress;
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(37, 99, 235, ${line.alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color === '#dc2626'
          ? `rgba(220, 38, 38, ${p.alpha})`
          : `rgba(37, 99, 235, ${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.05 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
