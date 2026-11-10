export default function SkeletonCard({ lines = 3, height = 'auto' }) {
  return (
    <div className="card animate-pulse" style={{ height }}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-neutral-200 dark:bg-neutral-700 rounded-lg ${
              i === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
