export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-text-muted py-6">
      <span className="inline-block w-4 h-4 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
      {label}
    </div>
  );
}