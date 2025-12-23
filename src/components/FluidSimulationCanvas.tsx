import { useRef, useEffect, useCallback } from 'react';

interface FluidSimulationCanvasProps {
  width: number;
  height: number;
  reynolds: number;
  resolution: number;
  isRunning: boolean;
}

const FluidSimulationCanvas = ({
  width,
  height,
  reynolds,
  resolution,
  isRunning,
}: FluidSimulationCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const velocityFieldRef = useRef<{ u: Float32Array; v: Float32Array } | null>(null);

  const initializeField = useCallback((nx: number, ny: number) => {
    const size = nx * ny;
    const u = new Float32Array(size);
    const v = new Float32Array(size);

    // Initialize with lid-driven cavity boundary conditions
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const idx = j * nx + i;
        // Top lid moves to the right
        if (j === ny - 1) {
          u[idx] = 1.0;
        }
      }
    }

    velocityFieldRef.current = { u, v };
  }, []);

  const updateSimulation = useCallback((nx: number, ny: number, dt: number, nu: number) => {
    if (!velocityFieldRef.current) return;

    const { u, v } = velocityFieldRef.current;
    const newU = new Float32Array(u.length);
    const newV = new Float32Array(v.length);

    // Simplified Navier-Stokes update (diffusion + advection)
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const idx = j * nx + i;
        const idxL = j * nx + (i - 1);
        const idxR = j * nx + (i + 1);
        const idxD = (j - 1) * nx + i;
        const idxU = (j + 1) * nx + i;

        // Diffusion (viscosity)
        const diffU = nu * (u[idxL] + u[idxR] + u[idxD] + u[idxU] - 4 * u[idx]);
        const diffV = nu * (v[idxL] + v[idxR] + v[idxD] + v[idxU] - 4 * v[idx]);

        // Advection (simplified upwind)
        const advU = -u[idx] * (u[idxR] - u[idxL]) / 2 - v[idx] * (u[idxU] - u[idxD]) / 2;
        const advV = -u[idx] * (v[idxR] - v[idxL]) / 2 - v[idx] * (v[idxU] - v[idxD]) / 2;

        newU[idx] = u[idx] + dt * (diffU + advU);
        newV[idx] = v[idx] + dt * (diffV + advV);
      }
    }

    // Apply boundary conditions
    for (let i = 0; i < nx; i++) {
      // Top lid
      newU[(ny - 1) * nx + i] = 1.0;
      newV[(ny - 1) * nx + i] = 0;
      // Bottom wall
      newU[i] = 0;
      newV[i] = 0;
    }
    for (let j = 0; j < ny; j++) {
      // Left wall
      newU[j * nx] = 0;
      newV[j * nx] = 0;
      // Right wall
      newU[j * nx + (nx - 1)] = 0;
      newV[j * nx + (nx - 1)] = 0;
    }

    velocityFieldRef.current = { u: newU, v: newV };
  }, []);

  const velocityToColor = (magnitude: number, maxMag: number): [number, number, number] => {
    const normalized = Math.min(magnitude / maxMag, 1);
    
    // Cyan to blue to purple gradient
    const r = Math.floor(normalized * 150);
    const g = Math.floor(200 - normalized * 100);
    const b = Math.floor(255 - normalized * 55);
    
    return [r, g, b];
  };

  const render = useCallback((ctx: CanvasRenderingContext2D, nx: number, ny: number) => {
    if (!velocityFieldRef.current) return;

    const { u, v } = velocityFieldRef.current;
    const cellWidth = width / nx;
    const cellHeight = height / ny;

    // Find max magnitude for normalization
    let maxMag = 0.001;
    for (let i = 0; i < u.length; i++) {
      const mag = Math.sqrt(u[i] * u[i] + v[i] * v[i]);
      if (mag > maxMag) maxMag = mag;
    }

    const imageData = ctx.createImageData(width, height);

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const i = Math.floor(px / cellWidth);
        const j = Math.floor((height - py - 1) / cellHeight);
        const idx = j * nx + i;

        if (idx >= 0 && idx < u.length) {
          const mag = Math.sqrt(u[idx] * u[idx] + v[idx] * v[idx]);
          const [r, g, b] = velocityToColor(mag, maxMag);

          const pixelIdx = (py * width + px) * 4;
          imageData.data[pixelIdx] = r;
          imageData.data[pixelIdx + 1] = g;
          imageData.data[pixelIdx + 2] = b;
          imageData.data[pixelIdx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw velocity vectors
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;

    const vectorStep = Math.max(2, Math.floor(nx / 20));
    for (let j = vectorStep; j < ny - vectorStep; j += vectorStep) {
      for (let i = vectorStep; i < nx - vectorStep; i += vectorStep) {
        const idx = j * nx + i;
        const x = (i + 0.5) * cellWidth;
        const y = height - (j + 0.5) * cellHeight;

        const scale = cellWidth * vectorStep * 0.8;
        const vx = u[idx] * scale;
        const vy = -v[idx] * scale;

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0.5) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + vx, y + vy);
          ctx.stroke();

          // Arrow head
          const angle = Math.atan2(vy, vx);
          const headLen = 4;
          ctx.beginPath();
          ctx.moveTo(x + vx, y + vy);
          ctx.lineTo(
            x + vx - headLen * Math.cos(angle - Math.PI / 6),
            y + vy - headLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(x + vx, y + vy);
          ctx.lineTo(
            x + vx - headLen * Math.cos(angle + Math.PI / 6),
            y + vy - headLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      }
    }
  }, [width, height]);

  useEffect(() => {
    initializeField(resolution, resolution);
  }, [resolution, initializeField]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nu = 1 / reynolds;
    const dt = 0.1;

    const animate = () => {
      if (isRunning) {
        updateSimulation(resolution, resolution, dt, nu);
        timeRef.current += dt;
      }

      render(ctx, resolution, resolution);

      if (isRunning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, reynolds, resolution, updateSimulation, render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default FluidSimulationCanvas;
