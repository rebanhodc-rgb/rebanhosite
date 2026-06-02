import { BrandBadge } from "@/frontend/components/brand/brand-badge";

export function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return (
    <div className="max-w-2xl">
      <BrandBadge>{eyebrow}</BrandBadge>
      <h2 className="serif mt-3 text-4xl leading-tight md:text-6xl">{title}</h2>
      {copy ? <p className="subtitle mt-4 leading-7 text-ink/70">{copy}</p> : null}
    </div>
  );
}
