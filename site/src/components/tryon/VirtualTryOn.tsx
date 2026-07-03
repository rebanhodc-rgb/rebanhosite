"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Sparkles, RefreshCw, ShieldCheck } from "lucide-react";
import { products } from "@/lib/products";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

export default function VirtualTryOn() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState(products[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserPhoto(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setStatus("idle");
  }

  async function runTryOn() {
    if (!userPhoto) return;
    setStatus("loading");
    setResult(null);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhoto,
          garmentImage: selected.images[0].src,
          productName: selected.name,
        }),
      });
      const data = (await res.json()) as { resultImageUrl?: string; error?: string };
      if (!res.ok || !data.resultImageUrl) {
        throw new Error(data.error ?? "Falha ao gerar provador virtual.");
      }
      setResult(data.resultImageUrl);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 md:px-8">
      <header className="mb-12 text-center">
        <p className="text-xs tracking-brand text-gold">EXPERIÊNCIA REBANHO</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Provador Virtual</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm text-stone">
          Suba uma foto sua e veja como cada peça fica em você, com inteligência
          artificial. Encontre o seu aceno antes de vestir.
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Painel de controle */}
        <div className="space-y-8">
          {/* 1. Foto */}
          <div>
            <h2 className="mb-3 text-xs tracking-brand">1 · SUA FOTO</h2>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 border border-dashed py-10 text-center transition-colors",
                userPhoto ? "border-ink/40" : "border-stone/50 hover:border-ink"
              )}
            >
              <Upload className="h-6 w-6 text-stone" />
              <span className="text-sm text-stone">
                {userPhoto ? "Trocar foto" : "Enviar foto (corpo visível)"}
              </span>
            </button>
          </div>

          {/* 2. Peça */}
          <div>
            <h2 className="mb-3 text-xs tracking-brand">2 · ESCOLHA A PEÇA</h2>
            <div className="grid grid-cols-4 gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelected(p);
                    setResult(null);
                    setStatus("idle");
                  }}
                  className={cn(
                    "relative aspect-[3/4] overflow-hidden border bg-line",
                    selected.id === p.id ? "border-ink" : "border-transparent hover:border-stone"
                  )}
                >
                  <Image src={p.images[0].src} alt={p.name} fill className="object-cover" />
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm">{selected.name}</p>
          </div>

          {/* 3. Provar */}
          <button
            onClick={runTryOn}
            disabled={!userPhoto || status === "loading"}
            className={cn(
              "flex w-full items-center justify-center gap-2 py-4 text-xs tracking-brand transition-colors",
              userPhoto && status !== "loading"
                ? "bg-ink text-bone hover:bg-ink/90"
                : "cursor-not-allowed bg-stone/30 text-stone"
            )}
          >
            {status === "loading" ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> PROCESSANDO…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> PROVAR AGORA</>
            )}
          </button>

          <p className="flex items-start gap-2 text-xs text-stone">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Sua foto é usada apenas para gerar a prévia e não é armazenada (LGPD).
          </p>
        </div>

        {/* Resultado */}
        <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden border border-line bg-line/40">
          <AnimatePresence mode="wait">
            {status === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-stone"
              >
                <RefreshCw className="h-8 w-8 animate-spin" />
                <p className="text-sm tracking-brand">VESTINDO O ACENO…</p>
              </motion.div>
            )}

            {status !== "loading" && result && userPhoto && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative h-full w-full"
              >
                {/* Composição mock: foto do usuário + overlay da peça.
                    Na Fase 3, isto vira a imagem única retornada pela API. */}
                {/* data URL/local upload do usuário: next/image não otimiza esse caso. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userPhoto}
                  alt="Sua foto"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-ink/60 to-transparent p-4">
                  <div className="flex items-center gap-3 bg-bone/95 px-4 py-2">
                    <div className="relative h-12 w-9 overflow-hidden bg-line">
                      <Image src={selected.images[0].src} alt={selected.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs tracking-brand">PRÉVIA · {selected.name}</p>
                      <p className="text-[10px] text-stone">resultado ilustrativo (mock)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {status === "idle" && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-8 text-center text-sm text-stone"
              >
                {userPhoto
                  ? "Clique em \"Provar agora\" para ver o resultado."
                  : "Sua prévia aparecerá aqui."}
              </motion.div>
            )}

            {status === "error" && (
              <p className="text-sm text-stone">Algo deu errado. Tente novamente.</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
