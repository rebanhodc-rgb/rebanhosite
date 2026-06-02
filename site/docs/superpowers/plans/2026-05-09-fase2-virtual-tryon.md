# Fase 2 — Virtual Try-On Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir ao usuário fazer upload de uma foto e visualizar como uma peça do catálogo ficaria em seu corpo, usando CatVTON em GPU serverless via RunPod.

**Architecture:** Worker Python (`runpod/handler.py`) empacotado em Docker e publicado no RunPod Serverless. Next.js API Route (`app/api/tryon/route.ts`) valida, encaminha o job, e faz polling. Hook `use-try-on.ts` gerencia o estado. Widget `try-on-widget.tsx` renderiza upload, loading, resultado e erro.

**Tech Stack:** Python 3.10 + CatVTON (PyTorch CUDA), Docker, RunPod Serverless SDK, Next.js 14 API Route, TypeScript, Tailwind CSS

---

> **PRÉ-REQUISITO**: Os gates manuais devem estar concluídos antes do teste E2E:
> 1. Docker Hub — conta criada, imagem buildada e publicada
> 2. RunPod — endpoint serverless configurado com a imagem Docker
> 3. `.env.local` com `RUNPOD_API_KEY` e `RUNPOD_ENDPOINT_ID`
>
> O código pode ser implementado antes, mas o teste E2E depende desses gates.

---

## Task 0: Estrutura do diretório RunPod

**Files:**
- Create: `runpod/handler.py` (raiz do repositório, fora de `site/`)
- Create: `runpod/Dockerfile`
- Create: `runpod/requirements.txt`

> **Importante:** estes arquivos ficam em `runpod/` na **raiz do repositório** (não dentro de `site/`).

- [ ] **Step 1: Verificar diretório raiz do repositório**

```bash
ls C:/Users/andre/Desktop/rebanho
```

Esperado: ver `site/`, possivelmente `runpod/` se já existir.

- [ ] **Step 2: Criar `runpod/requirements.txt`**

```
runpod==1.6.2
torch==2.1.0
torchvision
diffusers
transformers
accelerate
Pillow
numpy
```

- [ ] **Step 3: Criar `runpod/handler.py`**

```python
import runpod
import base64
import io
import os
import sys
import torch
from PIL import Image

sys.path.insert(0, "/app/CatVTON")

model = None


def load_model():
    global model
    if model is not None:
        return model

    from pipeline import CatVTONPipeline

    model = CatVTONPipeline(
        base_ckpt="booksforcharlie/stable-diffusion-inpainting",
        attn_ckpt="zhengchong/CatVTON",
        attn_ckpt_version="mix",
        weight_dtype=torch.float16,
        use_tf32=True,
        device="cuda",
        skip_safety_check=True,
    )
    return model


def b64_to_image(b64_string: str) -> Image.Image:
    data = base64.b64decode(b64_string)
    return Image.open(io.BytesIO(data)).convert("RGB")


def image_to_b64(image: Image.Image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def handler(job):
    job_input = job.get("input", {})

    person_b64 = job_input.get("person_image")
    garment_b64 = job_input.get("garment_image")

    if not person_b64 or not garment_b64:
        return {"error": "person_image e garment_image são obrigatórios"}

    try:
        person_image = b64_to_image(person_b64)
        garment_image = b64_to_image(garment_b64)

        pipeline = load_model()

        result = pipeline(
            person_image=person_image,
            cloth_image=garment_image,
            num_inference_steps=50,
            guidance_scale=2.5,
            generator=torch.Generator(device="cuda").manual_seed(42),
        )

        result_image = result[0] if isinstance(result, list) else result

        return {"result_image": image_to_b64(result_image)}

    except Exception as e:
        return {"error": str(e)}


runpod.serverless.start({"handler": handler})
```

- [ ] **Step 4: Criar `runpod/Dockerfile`**

```dockerfile
FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04

WORKDIR /app

RUN git clone https://github.com/Zheng-Chong/CatVTON /app/CatVTON

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY handler.py .

CMD ["python", "-u", "handler.py"]
```

- [ ] **Step 5: Commit**

```bash
cd C:/Users/andre/Desktop/rebanho
git add runpod/
git commit -m "feat: catvton runpod serverless worker"
```

---

## Task 1: Build e publicação da imagem Docker

> **Gate manual** — requer Docker Desktop instalado e conta no Docker Hub.

- [ ] **Step 1: Build da imagem**

```bash
cd C:/Users/andre/Desktop/rebanho/runpod
docker build -t SEU_USUARIO_DOCKERHUB/rebanho-catvton:latest .
```

Esperado: build completo sem erros (pode levar 10-20 minutos na primeira vez).

- [ ] **Step 2: Login no Docker Hub**

```bash
docker login
```

- [ ] **Step 3: Push da imagem**

```bash
docker push SEU_USUARIO_DOCKERHUB/rebanho-catvton:latest
```

- [ ] **Step 4: Anotar a URL da imagem**

Formato: `SEU_USUARIO_DOCKERHUB/rebanho-catvton:latest`

---

## Task 2: Configuração do RunPod Serverless

> **Gate manual** — requer conta RunPod com créditos.

- [ ] **Step 1: Criar endpoint no RunPod**

1. Acesse [runpod.io](https://runpod.io) → Serverless → New Endpoint
2. Container Image: `SEU_USUARIO_DOCKERHUB/rebanho-catvton:latest`
3. GPU: RTX 4090 (24GB VRAM)
4. Min Workers: 0
5. Max Workers: 3
6. Idle Timeout: 5 segundos
7. Salvar e aguardar status `READY`

- [ ] **Step 2: Anotar o Endpoint ID**

Formato: string alfanumérica visível na URL do endpoint.

- [ ] **Step 3: Criar `.env.local` em `site/`**

```bash
# site/.env.local — já no .gitignore
RUNPOD_API_KEY=sua_api_key_aqui
RUNPOD_ENDPOINT_ID=seu_endpoint_id_aqui
```

**NUNCA commitar este arquivo.**

---

## Task 3: API Route — `app/api/tryon/route.ts`

**Files:**
- Create: `site/app/api/tryon/route.ts`

- [ ] **Step 1: Criar `site/app/api/tryon/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY;
const RUNPOD_ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID;

const MAX_POLL_MS = 3 * 60 * 1000;
const POLL_INTERVAL_MS = 2000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function base64SizeBytes(b64: string): number {
  return Math.ceil((b64.length * 3) / 4);
}

export async function POST(req: NextRequest) {
  if (!RUNPOD_API_KEY || !RUNPOD_ENDPOINT_ID) {
    return NextResponse.json(
      { error: "Serviço de try-on não configurado." },
      { status: 503 }
    );
  }

  let body: { personImageBase64?: string; garmentImageBase64?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo JSON inválido." }, { status: 400 });
  }

  const { personImageBase64, garmentImageBase64 } = body;

  if (!personImageBase64 || !garmentImageBase64) {
    return NextResponse.json(
      { error: "personImageBase64 e garmentImageBase64 são obrigatórios." },
      { status: 400 }
    );
  }

  if (
    base64SizeBytes(personImageBase64) > MAX_IMAGE_BYTES ||
    base64SizeBytes(garmentImageBase64) > MAX_IMAGE_BYTES
  ) {
    return NextResponse.json(
      { error: "Imagem excede o limite de 5MB." },
      { status: 400 }
    );
  }

  const runResponse = await fetch(
    `https://api.runpod.io/v2/${RUNPOD_ENDPOINT_ID}/run`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          person_image: personImageBase64,
          garment_image: garmentImageBase64,
        },
      }),
    }
  );

  if (!runResponse.ok) {
    const text = await runResponse.text();
    console.error("[tryon] RunPod run error:", text);
    return NextResponse.json(
      { error: "Erro ao enviar job para o servidor de geração." },
      { status: 502 }
    );
  }

  const { id: jobId } = await runResponse.json() as { id: string };

  const deadline = Date.now() + MAX_POLL_MS;

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const statusRes = await fetch(
      `https://api.runpod.io/v2/${RUNPOD_ENDPOINT_ID}/status/${jobId}`,
      {
        headers: { Authorization: `Bearer ${RUNPOD_API_KEY}` },
      }
    );

    if (!statusRes.ok) {
      console.error("[tryon] RunPod status error:", await statusRes.text());
      continue;
    }

    const status = await statusRes.json() as {
      status: string;
      output?: { result_image?: string; error?: string };
    };

    if (status.status === "COMPLETED") {
      const resultImage = status.output?.result_image;
      if (!resultImage) {
        return NextResponse.json(
          { error: "Geração concluída mas sem imagem resultado." },
          { status: 502 }
        );
      }
      return NextResponse.json({ success: true, resultImageBase64: resultImage });
    }

    if (status.status === "FAILED") {
      console.error("[tryon] RunPod job failed:", status.output?.error);
      return NextResponse.json(
        { error: "A geração falhou no servidor. Tente novamente." },
        { status: 502 }
      );
    }
  }

  return NextResponse.json(
    { error: "A geração demorou mais que o esperado. Tente novamente." },
    { status: 504 }
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error)" | head -20
```

Esperado: sem erros TypeScript na nova rota.

- [ ] **Step 3: Commit**

```bash
cd site && git add app/api/tryon/route.ts && git commit -m "feat: tryon api route with runpod polling"
```

---

## Task 4: Hook — `frontend/hooks/use-try-on.ts`

**Files:**
- Create: `site/frontend/hooks/use-try-on.ts`

- [ ] **Step 1: Criar `site/frontend/hooks/use-try-on.ts`**

```typescript
"use client";

import { useState, useCallback } from "react";

type TryOnStatus = "idle" | "loading" | "success" | "error";

interface TryOnState {
  status: TryOnStatus;
  resultImageBase64: string | null;
  errorMessage: string | null;
}

interface UseTryOnReturn extends TryOnState {
  run: (personFile: File, garmentImageUrl: string) => Promise<void>;
  reset: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], "garment.jpg", { type: blob.type });
  return fileToBase64(file);
}

const INITIAL_STATE: TryOnState = {
  status: "idle",
  resultImageBase64: null,
  errorMessage: null,
};

export function useTryOn(): UseTryOnReturn {
  const [state, setState] = useState<TryOnState>(INITIAL_STATE);

  const run = useCallback(async (personFile: File, garmentImageUrl: string) => {
    setState({ status: "loading", resultImageBase64: null, errorMessage: null });

    try {
      const [personImageBase64, garmentImageBase64] = await Promise.all([
        fileToBase64(personFile),
        urlToBase64(garmentImageUrl),
      ]);

      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personImageBase64, garmentImageBase64 }),
      });

      const data = await res.json() as {
        success?: boolean;
        resultImageBase64?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.resultImageBase64) {
        setState({
          status: "error",
          resultImageBase64: null,
          errorMessage: data.error ?? "Erro desconhecido. Tente novamente.",
        });
        return;
      }

      setState({
        status: "success",
        resultImageBase64: data.resultImageBase64,
        errorMessage: null,
      });
    } catch {
      setState({
        status: "error",
        resultImageBase64: null,
        errorMessage: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, run, reset };
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error)" | head -20
```

- [ ] **Step 3: Commit**

```bash
cd site && git add frontend/hooks/use-try-on.ts && git commit -m "feat: use-try-on hook with file-to-base64 conversion"
```

---

## Task 5: Widget — `frontend/components/product/try-on-widget.tsx`

**Files:**
- Create: `site/frontend/components/product/try-on-widget.tsx`
- Modify: `site/app/(public)/produto/[slug]/page.tsx`

- [ ] **Step 1: Criar `site/frontend/components/product/try-on-widget.tsx`**

```typescript
"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTryOn } from "@/frontend/hooks/use-try-on";
import { cn } from "@/shared/cn";

interface TryOnWidgetProps {
  garmentImageUrl: string;
  productName: string;
}

export function TryOnWidget({ garmentImageUrl, productName }: TryOnWidgetProps) {
  const { status, resultImageBase64, errorMessage, run, reset } = useTryOn();
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPersonPreview(previewUrl);
    run(file, garmentImageUrl);
  };

  const handleReset = () => {
    reset();
    setPersonPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="py-12 px-4 bg-ink">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-subtitle text-xs uppercase tracking-widest text-gold text-center mb-2">
          Virtual Try-On
        </h2>
        <p className="font-body text-sm text-ivory/60 text-center mb-6">
          Veja como {productName} fica em você antes de comprar
        </p>
        <p className="font-body text-xs text-ivory/40 text-center mb-8">
          Sua foto é usada apenas para gerar a visualização e não é armazenada.
        </p>

        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="border border-gold/40 px-8 py-4 font-subtitle text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
              >
                Fazer upload da sua foto
              </button>
              <p className="font-body text-xs text-ivory/40">
                JPG ou PNG · máx 5MB · foto de corpo inteiro recomendada
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6"
            >
              {personPreview && (
                <div className="w-32 h-40 overflow-hidden border border-gold/20 opacity-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={personPreview} alt="Sua foto" className="w-full h-full object-cover" />
                </div>
              )}
              <p className="font-body text-sm text-ivory/60">
                Gerando visualização (~35 segundos)...
              </p>
              <div className="w-64 h-px bg-gold/20 overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}

          {status === "success" && resultImageBase64 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                {personPreview && (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-subtitle text-xs uppercase tracking-widest text-ivory/40">
                      Original
                    </p>
                    <div className="aspect-[3/4] overflow-hidden border border-gold/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={personPreview} alt="Original" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <p className="font-subtitle text-xs uppercase tracking-widest text-gold">
                    Com {productName}
                  </p>
                  <div className="aspect-[3/4] overflow-hidden border border-gold/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${resultImageBase64}`}
                      alt="Resultado do try-on"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <a
                  href={`data:image/png;base64,${resultImageBase64}`}
                  download={`rebanho-tryon-${Date.now()}.png`}
                  className="border border-gold/40 px-6 py-2 font-subtitle text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
                >
                  Baixar
                </a>
                <button
                  onClick={handleReset}
                  className="border border-ivory/20 px-6 py-2 font-subtitle text-xs uppercase tracking-widest text-ivory/60 hover:text-ivory hover:border-ivory/40 transition-colors"
                >
                  Tentar outra foto
                </button>
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="font-body text-sm text-copper">
                {errorMessage ?? "Algo deu errado. Tente novamente."}
              </p>
              <button
                onClick={handleReset}
                className="border border-gold/40 px-6 py-2 font-subtitle text-xs uppercase tracking-widest text-gold hover:bg-gold/10 transition-colors"
              >
                Tentar novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Ler `app/(public)/produto/[slug]/page.tsx`**

Localizar onde inserir o `TryOnWidget` (abaixo do `ProductPurchasePanel`).

- [ ] **Step 3: Adicionar `<TryOnWidget />` na página de produto**

Importar:
```typescript
import { TryOnWidget } from "@/frontend/components/product/try-on-widget";
```

Inserir abaixo do `ProductPurchasePanel`:
```tsx
<TryOnWidget
  garmentImageUrl={product.images[0]}
  productName={product.name}
/>
```

- [ ] **Step 4: Verificar build**

```bash
cd site && npm run build 2>&1 | grep -E "(error|Error)" | head -20
```

- [ ] **Step 5: Commit**

```bash
cd site && git add frontend/components/product/try-on-widget.tsx "app/(public)/produto/[slug]/page.tsx" && git commit -m "feat: try-on widget with upload, loading and result display"
```

---

## Task 6: Teste E2E (pós-gates)

> **Requer:** Docker image publicada, RunPod endpoint ativo, `.env.local` configurado.

- [ ] **Step 1: Iniciar servidor de desenvolvimento**

```bash
cd site && npm run dev
```

- [ ] **Step 2: Testar fluxo completo manualmente**

1. Abrir `http://localhost:3000/produto/cordis`
2. Rolar até a seção "Virtual Try-On"
3. Clicar em "Fazer upload da sua foto"
4. Selecionar uma foto de pessoa (JPG/PNG, corpo inteiro)
5. Aguardar loading (~35 segundos)
6. Verificar: grid 2 colunas (original | resultado) aparece
7. Testar botão "Baixar" — deve baixar PNG
8. Testar "Tentar outra foto" — deve voltar ao estado idle

- [ ] **Step 3: Testar casos de erro**

1. Imagem > 5MB → deve mostrar mensagem de erro amigável
2. Com RunPod offline → após 3 min → deve mostrar erro de timeout (504)
3. Sem internet → deve mostrar erro de conexão

- [ ] **Step 4: Verificar logs server-side**

Confirmar: API Route loga apenas erros do RunPod com `console.error`, não as imagens em base64.

- [ ] **Step 5: Commit final**

```bash
cd site && git log --oneline -8
```

Verificar: commits limpos do Task 0 ao Task 6.

---

## Verificação Final

- [ ] **Build limpo**

```bash
cd site && npm run build 2>&1 | tail -30
```

- [ ] **Sem secrets commitados**

```bash
git log --all --full-history -- "*.env*" | head -5
```

Esperado: sem resultados (`.env.local` nunca commitado).

- [ ] **Segurança LGPD confirmada**

Nenhuma imagem é persistida em banco ou storage. API Route transmite para RunPod e descarta. Aviso visível no widget antes do upload.
