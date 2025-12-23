const EquationDisplay = () => {
  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Navier-Stokes Equations
      </h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Momentum Equation
          </p>
          <div className="equation-display text-lg md:text-xl overflow-x-auto py-2">
            ρ(∂<span className="font-bold">u</span>/∂t + <span className="font-bold">u</span>·∇<span className="font-bold">u</span>) = −∇p + μ∇²<span className="font-bold">u</span> + <span className="font-bold">f</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Continuity Equation
          </p>
          <div className="equation-display text-lg md:text-xl py-2">
            ∇·<span className="font-bold">u</span> = 0
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">where:</span>
            <ul className="text-sm space-y-1">
              <li><span className="font-mono text-primary">ρ</span> = density</li>
              <li><span className="font-mono text-primary">u</span> = velocity</li>
              <li><span className="font-mono text-primary">p</span> = pressure</li>
            </ul>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">&nbsp;</span>
            <ul className="text-sm space-y-1">
              <li><span className="font-mono text-primary">μ</span> = viscosity</li>
              <li><span className="font-mono text-primary">f</span> = body forces</li>
              <li><span className="font-mono text-primary">t</span> = time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquationDisplay;
