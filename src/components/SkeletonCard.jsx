export default function SkeletonCard() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-video bg-slate-200 rounded-xl"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}