export default function PipelineLoading() {
  const cols = ["New", "Scoping", "Building", "Review", "Staging", "Live"];
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-shell animate-pulse" />
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(200px, 1fr))` }}
      >
        {cols.map((col) => (
          <div key={col} className="space-y-2">
            <div className="h-4 w-16 bg-shell animate-pulse" />
            <div className="border-t border-shell" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-shell p-3 space-y-2 animate-pulse"
              >
                <div className="h-4 w-3/4 bg-shell" />
                <div className="h-3 w-1/2 bg-shell" />
                <div className="h-6 w-full bg-shell" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
