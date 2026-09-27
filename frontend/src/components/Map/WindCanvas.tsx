import React, { useRef, useEffect } from 'react';

interface WindCanvasProps {
  windSpeedKmh: number;
  windDirectionDeg: number; // Meteorological direction: coming FROM this degree
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  speed: number;
}

export const WindCanvas: React.FC<WindCanvasProps> = ({
  windSpeedKmh,
  windDirectionDeg,
  opacity = 0.65
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Wind flows TOWARDS (windDirectionDeg + 180) % 360
    const flowAngleRad = ((windDirectionDeg + 180) % 360) * (Math.PI / 180);
    const u = Math.sin(flowAngleRad);
    const v = -Math.cos(flowAngleRad); // negative because canvas Y is inverted

    const particleCount = 1400;
    const particles: Particle[] = [];

    const createParticle = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 80),
      maxAge: 70 + Math.floor(Math.random() * 50),
      speed: (windSpeedKmh / 12) * (0.8 + Math.random() * 0.4)
    });

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const render = () => {
      // Clear canvas so the map underneath remains completely visible and crisp
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(6, 182, 212, ${opacity})`;

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const prevX = p.x;
        const prevY = p.y;

        p.x += u * p.speed;
        p.y += v * p.speed;
        p.age++;

        // Draw line segment
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);

        // Reset if out of bounds or expired
        if (p.age >= p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          particles[i] = createParticle();
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [windSpeedKmh, windDirectionDeg, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen"
    />
  );
};
