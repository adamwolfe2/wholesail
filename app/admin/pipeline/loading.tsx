export default function PipelineLoading() {
  const cols = ["New", "Scoping", "Building", "Review", "Staging", "Live"];
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-[#E5E1DB] animate-pulse" />
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(200px, 1fr))` }}
      >
        {cols.map((col) => (
          <div key={col} className="space-y-2">
            <div className="h-4 w-16 bg-[#E5E1DB] animate-pulse" />
            <div className="border-t border-[#E5E1DB]" />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-[#E5E1DB] p-3 space-y-2 animate-pulse"
              >
                <div className="h-4 w-3/4 bg-[#E5E1DB]" />
                <div className="h-3 w-1/2 bg-[#E5E1DB]" />
                <div className="h-6 w-full bg-[#E5E1DB]" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
