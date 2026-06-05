"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, HandHeart, Receipt, ArrowUpRight } from "lucide-react";
import { brl } from "@/shared/utils";
import { DEFAULT_DONATION_PARAMS, calculateDonationBreakdown } from "@/shared/donation";
import { donationProjects } from "@/shared/projects";

const UNIT_PRICE = 149;
const EASE = "cubic-bezier(0.32,0.72,0,1)";

export function DonationImpact() {
  const [quantity, setQuantity] = useState(2);

  const breakdown = useMemo(
    () => calculateDonationBreakdown(UNIT_PRICE * quantity, quantity, DEFAULT_DONATION_PARAMS),
    [quantity]
  );

  const setQty = (next: number) => setQuantity(Math.min(24, Math.max(1, next)));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-8">
      {/* Calculadora — Double-Bezel */}
      <div className="rounded-[2rem] bg-ink/5 p-1.5 ring-1 ring-ink/5">
        <div
          className="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-ink p-7 text-ivory shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] sm:p-9"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              <Receipt size={12} strokeWidth={1.25} /> 10% do lucro liquido
            </span>
            <h3 className="serif mt-5 text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.02]">
              Calcule o impacto da sua compra
            </h3>
            <p className="subtitle mt-3 max-w-sm text-sm leading-6 text-ivory/60">
              A cada pedido, reservamos 10% do lucro liquido — depois de custos, impostos e taxas — para o projeto que voce escolher.
            </p>
          </div>

          <div className="mt-8">
            <p className="subtitle text-[11px] font-semibold uppercase tracking-[0.22em] text-ivory/45">
              Quantidade de pecas
            </p>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-ivory/10 p-1 ring-1 ring-ivory/10">
                <button
                  type="button"
                  onClick={() => setQty(quantity - 1)}
                  aria-label="Diminuir quantidade"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/5 transition-transform duration-300 hover:bg-ivory/15 active:scale-90"
                  style={{ transitionTimingFunction: EASE }}
                >
                  <Minus size={16} strokeWidth={1.5} />
                </button>
                <span className="serif w-10 text-center text-3xl tabular-nums">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQty(quantity + 1)}
                  aria-label="Aumentar quantidade"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ivory/5 transition-transform duration-300 hover:bg-ivory/15 active:scale-90"
                  style={{ transitionTimingFunction: EASE }}
                >
                  <Plus size={16} strokeWidth={1.5} />
                </button>
              </div>
              <span className="subtitle text-sm text-ivory/55">{brl(UNIT_PRICE * quantity)} em compras</span>
            </div>

            <div className="mt-7 flex items-end justify-between border-t border-ivory/10 pt-6">
              <div>
                <p className="subtitle text-[11px] font-semibold uppercase tracking-[0.22em] text-gold/70">
                  Doacao gerada
                </p>
                <p className="serif mt-1 text-[clamp(2.6rem,7vw,3.6rem)] leading-none text-gold">
                  {brl(breakdown.donation)}
                </p>
              </div>
              <HandHeart size={40} strokeWidth={1} className="mb-1 text-gold/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Projetos beneficiados */}
      <div className="grid gap-4">
        <p className="subtitle text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/45">
          Para onde vai — voce escolhe no checkout
        </p>
        {donationProjects.map((project) => (
          <div
            key={project.id}
            className="group rounded-[1.6rem] bg-ink/[0.03] p-1.5 ring-1 ring-ink/5 transition-transform duration-500 hover:-translate-y-0.5"
            style={{ transitionTimingFunction: EASE }}
          >
            <div className="relative overflow-hidden rounded-[calc(1.6rem-0.375rem)] bg-ivory/70 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
              <span
                className="absolute left-0 top-5 h-[calc(100%-2.5rem)] w-1 rounded-full"
                style={{ backgroundColor: project.accent }}
              />
              <div className="flex items-start justify-between gap-4 pl-3">
                <div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: project.accent }}
                  >
                    {project.cause}
                  </span>
                  <h4 className="serif mt-1 text-2xl leading-tight">{project.name}</h4>
                  <p className="subtitle mt-1 text-xs text-ink/50">
                    {project.org} · {project.city} — {project.state}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-6 text-ink/65">{project.description}</p>
                </div>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/5 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-[1px]"
                  style={{ transitionTimingFunction: EASE }}
                >
                  <ArrowUpRight size={16} strokeWidth={1.5} className="text-ink/55" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
