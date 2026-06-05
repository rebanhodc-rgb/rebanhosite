# Design: Checkout Completo, Frete e Perfil do Usuário

**Data:** 2026-06-05  
**Status:** Aprovado  
**Escopo:** Frete com Melhor Envio, CEP auto-fill, cartões salvos via Stripe Customer, perfil e endereços do usuário

---

## 1. Visão Geral

Expandir o site REBANHO para suportar:

1. **CEP com auto-fill** — ao digitar o CEP no checkout (ou no cadastro de endereço), ViaCEP preenche automaticamente logradouro, bairro, cidade e UF
2. **Endereço estruturado** — campos separados: rua, número, complemento, bairro, cidade, UF, CEP
3. **Cálculo de frete** — integração com Melhor Envio para listar opções (PAC, SEDEX, transportadoras privadas) com preço e prazo por CEP
4. **Cartões salvos** — Stripe Customer por usuário, setup intent para salvar cartão, checkout usa cartão salvo
5. **Perfil expandido** — editar dados pessoais, gerenciar endereços salvos, gerenciar cartões, histórico de pedidos

---

## 2. Modelo de Dados

### 2.1 Alterações no modelo `User`

```prisma
model User {
  // ... campos existentes ...
  stripeCustomerId String?   // ID do Customer no Stripe
  phone            String?   // Telefone principal
  cpf              String?   // CPF (armazenado sem máscara)
  addresses        Address[]
}
```

### 2.2 Nova tabela `Address`

```prisma
model Address {
  id            String   @id @default(cuid())
  userId        String
  label         String   // "Casa", "Trabalho", etc.
  recipientName String
  street        String   // Logradouro (do ViaCEP)
  number        String   // Número (usuário preenche)
  complement    String?  // Complemento (usuário preenche)
  neighborhood  String   // Bairro (do ViaCEP)
  city          String   // Cidade (do ViaCEP)
  state         String   // UF 2 chars (do ViaCEP)
  cep           String   // CEP sem máscara (8 dígitos)
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### 2.3 Alterações no modelo `Order`

```prisma
model Order {
  // ... campos existentes ...
  phone          String?   // Telefone do comprador (já coletado, agora armazenado)
  street         String    // Logradouro
  number         String    // Número
  complement     String?   // Complemento
  neighborhood   String    // Bairro
  // cep, city, state já existem
  shippingMethod  String?  // Ex: "pac", "sedex"
  shippingCarrier String?  // Ex: "Correios", "Jadlog"
  shippingCost    Decimal? @db.Decimal(10, 2)
  shippingDays    Int?     // Prazo estimado em dias úteis
  trackingCode    String?  // Código de rastreamento
}
```

---

## 3. Serviços Backend

### 3.1 `backend/services/cep.ts`

```typescript
export type CepData = {
  cep: string;
  street: string;      // logradouro
  neighborhood: string; // bairro
  city: string;        // localidade
  state: string;       // uf
  valid: boolean;
};

export async function lookupCep(cep: string): Promise<CepData>
```

- Chama `https://viacep.com.br/ws/{cep}/json/`
- Retorna `valid: false` se CEP não encontrado (campo `erro` na resposta)
- Sem autenticação necessária, gratuito

### 3.2 `backend/services/shipping.ts`

```typescript
export type ShippingOption = {
  id: number;          // ID do serviço no Melhor Envio
  name: string;        // "PAC", "SEDEX", etc.
  carrier: string;     // "Correios", "Jadlog", etc.
  price: number;       // Preço em reais
  days: number;        // Prazo em dias úteis
  logoUrl: string;
};

export async function calculateShipping(params: {
  fromCep: string;     // CEP de origem (do lojista)
  toCep: string;       // CEP do destinatário
  items: Array<{ weight: number; width: number; height: number; length: number; quantity: number }>;
}): Promise<ShippingOption[]>
```

- Autenticação: Bearer token da Melhor Envio (`MELHOR_ENVIO_TOKEN` env var)
- Endpoint: `https://melhorenvio.com.br/api/v2/me/shipment/calculate`
- Retorna lista ordenada por preço
- CEP de origem configurável via `STORE_CEP` env var

### 3.3 `backend/services/stripe-customer.ts`

```typescript
export async function getOrCreateStripeCustomer(user: { id: string; email: string; name?: string }): Promise<string>
// Retorna stripeCustomerId; cria no Stripe e salva no User se não existir

export async function listSavedCards(stripeCustomerId: string): Promise<SavedCard[]>
// Lista PaymentMethods do tipo "card" do Customer

export async function detachCard(paymentMethodId: string): Promise<void>
// Remove cartão salvo

export async function createSetupIntent(stripeCustomerId: string): Promise<string>
// Retorna clientSecret para salvar novo cartão via Stripe Elements
```

---

## 4. API Routes

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/cep/[cep]` | Consulta ViaCEP, retorna dados do endereço |
| POST | `/api/shipping/calculate` | Calcula opções de frete via Melhor Envio |
| GET | `/api/account/addresses` | Lista endereços salvos do usuário |
| POST | `/api/account/addresses` | Cria novo endereço |
| PATCH | `/api/account/addresses/[id]` | Atualiza endereço |
| DELETE | `/api/account/addresses/[id]` | Remove endereço |
| GET | `/api/account/cards` | Lista cartões salvos (via Stripe) |
| POST | `/api/account/cards/setup` | Cria SetupIntent para adicionar cartão |
| DELETE | `/api/account/cards/[id]` | Remove cartão salvo |
| PATCH | `/api/account/profile` | Atualiza nome, telefone, CPF |

---

## 5. Fluxo do Checkout

```
1. Usuário digita CEP
   → GET /api/cep/[cep]
   → Auto-fill: rua, bairro, cidade, UF
   → Usuário preenche: número, complemento

2. CEP validado
   → POST /api/shipping/calculate (peso estimado baseado nos itens)
   → Exibe opções de frete com preço e prazo
   → Usuário seleciona método

3. Subtotal calculado:
   Itens + frete + doação (10% do lucro líquido)

4. Pagamento:
   a. Usuário logado COM cartão salvo:
      → Exibe cartões salvos, seleciona um
      → Cria PaymentIntent com Customer + PaymentMethod
      → Confirma no frontend com Stripe.js
   b. Usuário logado SEM cartão salvo:
      → Stripe Elements (card input) com opção "Salvar para próximas compras"
      → Se marcado: cria SetupIntent → PaymentIntent
   c. Usuário anônimo:
      → Stripe Checkout Session (comportamento atual)

5. Webhook stripe confirma pagamento
   → Order atualizado com shippingMethod, shippingCost, shippingCarrier, shippingDays
```

---

## 6. Páginas da Conta

### `/minha-conta` — Perfil
- Exibe nome, email, CPF, telefone
- Formulário inline para editar (PATCH `/api/account/profile`)
- Link para alterar senha (futuramente)

### `/minha-conta/enderecos` — Endereços
- Lista endereços salvos com label e endereço completo
- Botão "Definir como padrão"
- Botão "Editar" e "Remover"
- Formulário de novo endereço com CEP auto-fill

### `/minha-conta/cartoes` — Cartões
- Lista cartões salvos (bandeira, últimos 4 dígitos, validade)
- Botão "Remover"
- Botão "Adicionar cartão" → SetupIntent + Stripe Elements

### `/meus-pedidos` — Histórico de Pedidos (expandido)
- Lista pedidos com: data, total, status de pagamento, status de envio
- Expandir para ver itens, projeto de doação, rastreamento
- Código de rastreamento clicável

---

## 7. Variáveis de Ambiente Necessárias

```env
MELHOR_ENVIO_TOKEN=      # Bearer token da API Melhor Envio
MELHOR_ENVIO_SANDBOX=    # "true" para sandbox durante dev
STORE_CEP=               # CEP de origem dos envios (do lojista)
STORE_WEIGHT_GRAMS=      # Peso padrão por peça em gramas (ex: 350)
STORE_WIDTH_CM=          # Dimensões da embalagem (largura)
STORE_HEIGHT_CM=         # Dimensões da embalagem (altura)
STORE_LENGTH_CM=         # Dimensões da embalagem (comprimento)
```

---

## 8. Ordem de Implementação

1. Schema migration (Address, novos campos em User e Order)
2. `cep.ts` + API route `/api/cep/[cep]`
3. `shipping.ts` + API route `/api/shipping/calculate`
4. `stripe-customer.ts` + rotas de cartões
5. Checkout — CEP auto-fill e endereço estruturado
6. Checkout — seleção de método de frete
7. Checkout — pagamento com cartão salvo
8. Conta — perfil editável
9. Conta — endereços salvos
10. Conta — cartões salvos
11. Conta — histórico de pedidos expandido

---

## 9. O que Está Fora do Escopo

- OAuth (Google, Apple) — futuro
- Parcelamento de cartão — futuro
- Rastreamento automático por webhook da transportadora — futuro
- Frete internacional — fora do escopo
- Múltiplos endereços por pedido — fora do escopo
