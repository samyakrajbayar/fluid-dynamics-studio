const ColorLegend = () => {
  return (
    <div className="glass-panel p-4">
      <h4 className="text-sm font-semibold text-foreground mb-3">
        Velocity Magnitude
      </h4>
      <div className="flex items-center gap-3">
        <div 
          className="h-4 flex-1 rounded"
          style={{
            background: 'linear-gradient(to right, rgb(0, 200, 255), rgb(75, 150, 230), rgb(150, 100, 200))'
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted-foreground font-mono">
        <span>0</span>
        <span>|u|</span>
        <span>max</span>
      </div>
    </div>
  );
};

export default ColorLegend;
