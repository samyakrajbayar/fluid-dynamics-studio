import { useRef, useEffect, useCallback, useState } from 'react';

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
  const velocityFieldRef = useRef<{ u: Float32Array; v: Float32Array } | null>(null);
  const [initialized, setInitialized] = useState(false);

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
    setInitialized(true);
  }, []);

  const updateSimulation = useCallback((nx: number, ny: number, nu: number) => {
    if (!velocityFieldRef.current) return;

    const { u, v } = velocityFieldRef.current;
    const newU = new Float32Array(u.length);
    const newV = new Float32Array(v.length);

    const dx = 1.0 / nx;
    const dy = 1.0 / ny;
    
    // CFL condition for stability
    const dt = Math.min(0.25 * dx * dx / nu, 0.1 * dx);

    // Navier-Stokes update with proper grid spacing
    for (let j = 1; j < ny - 1; j++) {
      for (let i = 1; i < nx - 1; i++) {
        const idx = j * nx + i;
        const idxL = j * nx + (i - 1);
        const idxR = j * nx + (i + 1);
        const idxD = (j - 1) * nx + i;
        const idxU = (j + 1) * nx + i;

        // Diffusion (Laplacian with proper grid spacing)
        const d2udx2 = (u[idxL] - 2 * u[idx] + u[idxR]) / (dx * dx);
        const d2udy2 = (u[idxD] - 2 * u[idx] + u[idxU]) / (dy * dy);
        const d2vdx2 = (v[idxL] - 2 * v[idx] + v[idxR]) / (dx * dx);
        const d2vdy2 = (v[idxD] - 2 * v[idx] + v[idxU]) / (dy * dy);

        // Advection (upwind scheme for stability)
        const dudx = u[idx] > 0 
          ? (u[idx] - u[idxL]) / dx 
          : (u[idxR] - u[idx]) / dx;
        const dudy = v[idx] > 0 
          ? (u[idx] - u[idxD]) / dy 
          : (u[idxU] - u[idx]) / dy;
        const dvdx = u[idx] > 0 
          ? (v[idx] - v[idxL]) / dx 
          : (v[idxR] - v[idx]) / dx;
        const dvdy = v[idx] > 0 
          ? (v[idx] - v[idxD]) / dy 
          : (v[idxU] - v[idx]) / dy;

        newU[idx] = u[idx] + dt * (nu * (d2udx2 + d2udy2) - u[idx] * dudx - v[idx] * dudy);
        newV[idx] = v[idx] + dt * (nu * (d2vdx2 + d2vdy2) - u[idx] * dvdx - v[idx] * dvdy);
      }
    }

    // Apply boundary conditions
    for (let i = 0; i < nx; i++) {
      // Top lid moves to the right
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
    
    // Dark blue to cyan to bright cyan gradient
    const r = Math.floor(20 + normalized * 80);
    const g = Math.floor(60 + normalized * 180);
    const b = Math.floor(120 + normalized * 135);
    
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    const vectorStep = Math.max(2, Math.floor(nx / 15));
    for (let j = vectorStep; j < ny - vectorStep; j += vectorStep) {
      for (let i = vectorStep; i < nx - vectorStep; i += vectorStep) {
        const idx = j * nx + i;
        const x = (i + 0.5) * cellWidth;
        const y = height - (j + 0.5) * cellHeight;

        const scale = cellWidth * vectorStep * 0.6;
        const vx = u[idx] * scale;
        const vy = -v[idx] * scale;

        const mag = Math.sqrt(vx * vx + vy * vy);
        if (mag > 0.3) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + vx, y + vy);
          ctx.stroke();

          const angle = Math.atan2(vy, vx);
          const headLen = 5;
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

  // Initialize field on mount and resolution change
  useEffect(() => {
    initializeField(resolution, resolution);
  }, [resolution, initializeField]);

  // Render initial state immediately after initialization
  useEffect(() => {
    if (!initialized) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx, resolution, resolution);
  }, [initialized, resolution, render]);

  // Animation loop
  useEffect(() => {
    if (!isRunning || !initialized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nu = 1 / reynolds;

    const animate = () => {
      // Run multiple iterations per frame for faster convergence
      for (let i = 0; i < 5; i++) {
        updateSimulation(resolution, resolution, nu);
      }
      render(ctx, resolution, resolution);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, initialized, reynolds, resolution, updateSimulation, render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-lg border border-border"
    />
  );
};

export default FluidSimulationCanvas;
