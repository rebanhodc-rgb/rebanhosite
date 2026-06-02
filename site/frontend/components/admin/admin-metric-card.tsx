export function AdminMetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/65 p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-copper">{label}</p>
      <strong className="serif mt-3 block text-4xl font-medium">{value}</strong>
      <p className="mt-2 text-sm text-ink/60">{hint}</p>
    </div>
  );
}
