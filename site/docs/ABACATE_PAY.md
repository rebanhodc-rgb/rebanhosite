# Integração — Abacate Pay (Pix)

> Guia para o agente de IA implementar o pagamento. Fase 2.
> Docs oficiais: https://docs.abacatepay.com

## Visão geral
Abacate Pay é o gateway de pagamento (foco em Pix). Fluxo:
1. Cliente finaliza o carrinho → frontend chama `POST /api/checkout`.
2. Backend (route handler) chama a API do Abacate Pay para criar uma cobrança Pix.
3. Abacate devolve um QR Code / copia-e-cola → mostramos pro cliente.
4. Abacate envia **webhook** quando o pagamento é confirmado → marcamos pedido como pago.

## Variáveis de ambiente (.env.local)
```
ABACATEPAY_API_KEY=...          # chave secreta do painel Abacate Pay
ABACATEPAY_WEBHOOK_SECRET=...   # para validar webhooks
```

## Endpoints a criar
- `src/app/api/checkout/route.ts` — cria a cobrança Pix.
- `src/app/api/webhooks/abacatepay/route.ts` — recebe confirmação de pagamento.

## Exemplo de criação de cobrança (pseudo)
```ts
// POST https://api.abacatepay.com/v1/billing/create  (confirmar endpoint na doc oficial)
const res = await fetch("https://api.abacatepay.com/v1/billing/create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    frequency: "ONE_TIME",
    methods: ["PIX"],
    products: cartItems.map(i => ({
      externalId: i.id, name: i.name, quantity: i.qty, price: i.priceCents,
    })),
    returnUrl: "https://rebanhodc.com.br/pedido/sucesso",
    completionUrl: "https://rebanhodc.com.br/pedido/concluido",
  }),
});
```

> ⚠️ Confirmar os nomes exatos dos campos/endpoints na doc oficial antes de implementar.
> O gateway pode mudar a API. Este arquivo é um guia de fluxo, não contrato fixo.

## Checklist
- [ ] Conta criada no Abacate Pay + chaves no `.env.local`
- [ ] Rota /api/checkout gerando QR Pix
- [ ] Tela de pagamento mostrando QR + copia-e-cola + status
- [ ] Webhook validando assinatura e atualizando status do pedido
- [ ] Persistência de pedidos (DB — ver Fase 2)
