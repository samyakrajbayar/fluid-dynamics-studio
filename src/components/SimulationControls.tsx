import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface SimulationControlsProps {
  reynolds: number;
  setReynolds: (value: number) => void;
  resolution: number;
  setResolution: (value: number) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
  onReset: () => void;
}

const SimulationControls = ({
  reynolds,
  setReynolds,
  resolution,
  setResolution,
  isRunning,
  setIsRunning,
  onReset,
}: SimulationControlsProps) => {
  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="glow"
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          className="min-w-[140px]"
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Simulate
            </>
          )}
        </Button>

        <Button variant="outline" size="lg" onClick={onReset}>
          <RotateCcw className="w-5 h-5" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Reynolds Number
            </label>
            <span className="font-mono text-primary text-sm">Re = {reynolds}</span>
          </div>
          <Slider
            value={[reynolds]}
            onValueChange={([value]) => setReynolds(value)}
            min={10}
            max={1000}
            step={10}
          />
          <p className="text-xs text-muted-foreground">
            Higher values increase turbulence
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-foreground">
              Grid Resolution
            </label>
            <span className="font-mono text-primary text-sm">{resolution} × {resolution}</span>
          </div>
          <Slider
            value={[resolution]}
            onValueChange={([value]) => setResolution(value)}
            min={20}
            max={100}
            step={10}
          />
          <p className="text-xs text-muted-foreground">
            Higher resolution increases accuracy
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-2">Simulation Info</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>• Lid-driven cavity flow</p>
          <p>• Top boundary moves right at u = 1</p>
          <p>• No-slip walls on all other sides</p>
        </div>
      </div>
    </div>
  );
};

export default SimulationControls;
