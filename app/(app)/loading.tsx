export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="h-12 rounded-lg bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-gray-200" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
