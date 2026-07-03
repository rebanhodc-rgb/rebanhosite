# Integração — Provador Virtual (Virtual Try-On)

> Guia para o agente de IA. Fase 3. A **UI já está pronta** em `src/components/tryon/`.
> Falta só criar o backend que chama a API de IA.

## Como funciona
1. Usuário sobe uma foto sua (corpo/torso visível) na tela do provador.
2. Escolhe uma peça do catálogo.
3. Frontend envia foto + imagem da peça → `POST /api/tryon`.
4. Backend chama a API de try-on → recebe a imagem da pessoa "vestindo" a peça.
5. Mostra o resultado.

## Opções de API (escolher uma)

### Opção A — IDM-VTON via Replicate (recomendado p/ começar)
- Modelo open-source de try-on hospedado. Paga por uso (centavos/imagem).
- `REPLICATE_API_TOKEN` no `.env.local`.
- Endpoint: https://replicate.com/cuuupid/idm-vton (confirmar slug atual).

### Opção B — FASHN AI
- API comercial dedicada a try-on de roupas, qualidade alta.
- https://fashn.ai — `FASHN_API_KEY`.

### Opção C — FAL.ai
- Hospeda vários modelos de try-on com latência baixa. `FAL_KEY`.

## Endpoint a criar
`src/app/api/tryon/route.ts`:
```ts
// recebe { userPhoto (base64/url), garmentImage (url) }
// chama a API escolhida, faz polling se necessário (Replicate é assíncrono)
// retorna { resultImageUrl }
```

## Variáveis de ambiente
```
REPLICATE_API_TOKEN=...   # se Opção A
FASHN_API_KEY=...         # se Opção B
FAL_KEY=...               # se Opção C
TRYON_PROVIDER=replicate  # replicate | fashn | fal
```

## Notas de UX (já implementadas na UI)
- Estado de loading (try-on leva ~10-25s).
- Aviso de privacidade: a foto do usuário é processada e não armazenada.
- Fallback se a API falhar.

## Checklist
- [ ] Escolher provedor + chave no `.env.local`
- [ ] Rota /api/tryon funcional
- [ ] Conectar a UI (`VirtualTryOn`) ao endpoint real (hoje usa mock)
- [ ] Tratar erros e timeouts
- [ ] Aviso de privacidade/LGPD sobre uso da foto
