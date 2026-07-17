export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-gray-200" />
        ))}
      </div>
      <div className="h-10 rounded-lg bg-gray-200" />
    </div>
  );
}
