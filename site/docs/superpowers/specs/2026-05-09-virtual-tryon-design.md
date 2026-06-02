# Fase 2 — Virtual Try-On: Design Spec

**Data:** 2026-05-09  
**Projeto:** REBANHO Site (Next.js 14)  
**Escopo:** Feature de Virtual Try-On com CatVTON + RunPod Serverless

---

## Contexto

Feature que permite ao usuário fazer upload de uma foto sua e ver como a peça de roupa ficaria no seu corpo, usando o modelo open-source CatVTON rodando em GPU serverless na RunPod. Só paga quando alguém usa.

---

## Arquitetura

```
[/produto/[slug]]
    │  usuário faz upload da foto
    ▼
[TryOnWidget]  →  POST /api/tryon
                       │
                  [Next.js API Route]
                       │  polling a cada 2s (timeout 3min)
                  [RunPod Serverless Endpoint]
                       │  roda CatVTON na GPU (RTX 4090 recomendado)
                  [resultado base64]
                       │
              [TryOnWidget exibe original vs. resultado]
```

---

## Pré-requisitos externos (gates manuais)

Antes de começar a implementação de código, estes três itens precisam estar prontos:

1. **Docker Hub** — conta criada, Docker Desktop instalado localmente
2. **RunPod** — conta com créditos, endpoint serverless configurado com a imagem Docker buildada
3. **Variáveis de ambiente** — `RUNPOD_API_KEY` e `RUNPOD_ENDPOINT_ID` no `.env.local`

A implementação de código pode ser feita antes, mas o teste end-to-end só é possível após esses gates.

---

## Componentes de código

### `handler.py` + `Dockerfile` (infraestrutura — em `runpod/` na raiz do repositório, fora de `site/`)
- Worker Python que carrega CatVTON na GPU uma vez e processa cada job
- Dockerfile baseado em `runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel-ubuntu22.04`
- Clona `https://github.com/Zheng-Chong/CatVTON` na imagem
- Recebe `{ person_image, garment_image }` em base64, retorna `{ result_image }` em base64
- GPU recomendada: RTX 4090 (24GB VRAM), Min Workers: 0, Max Workers: 3

### `app/api/tryon/route.ts`
- Valida presença e tamanho (máx 5MB) das imagens
- Envia job para RunPod `POST /v2/{endpointId}/run`
- Faz polling em `GET /v2/{endpointId}/status/{jobId}` a cada 2s
- Timeout de 3 minutos — retorna 504 com mensagem amigável
- Retorna `{ success: true, resultImageBase64 }` ou `{ error: string }`

### `frontend/hooks/use-try-on.ts`
- Estado: `idle | loading | success | error`
- Converte `File` para base64 via `FileReader`
- Busca imagem do produto via `fetch` (URL do catálogo) e converte para `File`
- Chama `POST /api/tryon` e gerencia o ciclo de vida da resposta

### `frontend/components/product/try-on-widget.tsx`
- Upload da foto da pessoa com preview local imediato
- Loading state com mensagem "~35 segundos" e barra de progresso indeterminada
- Resultado: grid 2 colunas (original | resultado) com botão download e "Tentar outra foto"
- Erro: mensagem amigável + botão "Tentar novamente"
- Aviso LGPD fixo: "Sua foto é usada apenas para gerar a visualização e não é armazenada."
- Integrado na página `/produto/[slug]`, abaixo do `ProductPurchasePanel`

---

## Fluxo de dados detalhado

1. Usuário seleciona foto → `FileReader.readAsDataURL` → remove prefixo `data:image/...;base64,`
2. Imagem do produto: `fetch(product.images[0])` → `response.blob()` → `new File([blob], ...)`
3. `POST /api/tryon` com `{ personImageBase64, garmentImageBase64 }`
4. API Route: `POST /v2/{endpointId}/run` → recebe `{ id: jobId }`
5. Loop de polling: `GET /v2/{endpointId}/status/{jobId}` a cada 2s
6. `status === "COMPLETED"` → retorna `output.result_image`
7. Widget exibe `data:image/png;base64,{result_image}`

---

## Validações e limites

| Validação | Onde | Limite |
|---|---|---|
| Tamanho da imagem | Cliente + API Route | 5MB por imagem |
| Timeout de polling | API Route | 3 minutos (504) |
| Campos obrigatórios | API Route | 400 se ausente |
| RunPod error | API Route | 502 com log server-side |

---

## LGPD

- Nenhuma imagem é persistida — a API Route retransmite para RunPod e descarta
- Aviso visível ao usuário antes/durante o uso
- Se o produto evoluir para armazenar resultados: atualizar Política de Privacidade

---

## Variáveis de ambiente

```
RUNPOD_API_KEY=        # API Key da conta RunPod
RUNPOD_ENDPOINT_ID=    # ID do endpoint serverless configurado
```

Ambas adicionadas ao `.env.local` (já no `.gitignore`). Nunca commitadas.

---

## Estimativa de custo RunPod

| GPU | Custo/hora | Tempo/geração | Custo/imagem |
|---|---|---|---|
| RTX 4090 | ~$0.74/h | ~20s | ~$0.004 |

Em modo Serverless (Min Workers: 0): custo zero quando idle.

---

## Fora do escopo

- Armazenamento de resultados gerados
- Histórico de try-ons por usuário
- Máscara manual (usa modo mask-free do CatVTON)
- Múltiplos seeds/variações por geração
