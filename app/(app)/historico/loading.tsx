export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="h-64 rounded-lg bg-gray-200" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
