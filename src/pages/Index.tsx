import { useState, useCallback } from 'react';
import FluidSimulationCanvas from '@/components/FluidSimulationCanvas';
import SimulationControls from '@/components/SimulationControls';
import EquationDisplay from '@/components/EquationDisplay';
import ColorLegend from '@/components/ColorLegend';
import { Droplets } from 'lucide-react';

const Index = () => {
  const [reynolds, setReynolds] = useState(100);
  const [resolution, setResolution] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setResetKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-fluid-blue/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 glow-subtle">
                <Droplets className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">NS Solver</h1>
                <p className="text-xs text-muted-foreground">Navier-Stokes Fluid Dynamics</p>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-3xl mx-auto space-y-4" style={{ animation: 'fade-in 0.6s ease-out forwards' }}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
              Navier-Stokes
              <span className="block text-primary">Equation Solver</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore computational fluid dynamics with an interactive 2D simulation 
              of the incompressible Navier-Stokes equations
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Simulation Area */}
            <div className="lg:col-span-2 space-y-4" style={{ animation: 'fade-in 0.6s ease-out 0.2s forwards', opacity: 0 }}>
              <div className="glass-panel p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    Lid-Driven Cavity Flow
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isRunning 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary text-muted-foreground'
                  }`}>
                    {isRunning ? 'Running' : 'Paused'}
                  </span>
                </div>
                <div className="flex justify-center bg-background/50 rounded-lg p-4">
                  <FluidSimulationCanvas
                    key={resetKey}
                    width={500}
                    height={500}
                    reynolds={reynolds}
                    resolution={resolution}
                    isRunning={isRunning}
                  />
                </div>
              </div>
              <ColorLegend />
            </div>

            {/* Controls Panel */}
            <div className="space-y-6" style={{ animation: 'fade-in 0.6s ease-out 0.4s forwards', opacity: 0 }}>
              <SimulationControls
                reynolds={reynolds}
                setReynolds={setReynolds}
                resolution={resolution}
                setResolution={setResolution}
                isRunning={isRunning}
                setIsRunning={setIsRunning}
                onReset={handleReset}
              />
              <EquationDisplay />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              Solving the millennium prize problem, one timestep at a time
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
