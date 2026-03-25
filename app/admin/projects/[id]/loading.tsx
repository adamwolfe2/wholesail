export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6 max-w-6xl animate-pulse">
      <div className="h-4 w-48 bg-shell" />
      <div className="h-8 w-64 bg-shell" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border border-shell p-5 space-y-3">
              <div className="h-5 w-1/3 bg-shell" />
              <div className="h-4 w-full bg-shell" />
              <div className="h-4 w-2/3 bg-shell" />
            </div>
          ))}
        </div>
        <div className="border border-shell p-5 h-96 bg-shell" />
      </div>
    </div>
  );
}
