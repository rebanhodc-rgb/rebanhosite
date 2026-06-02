# REBANHO

E-commerce Next.js para uma marca brasileira de moda catolica premium: editorial, minimalista, responsiva e com logica de doacao de 10% por pedido.

## Rodar localmente

```bash
cd C:\Users\andre\Desktop\rebanho\site
npm install
copy .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Configure `DATABASE_URL` com Neon, Supabase ou outro PostgreSQL antes de `db push`.

## Rotas

- `/` home editorial
- `/pre-lancamento` captura de leads
- `/loja` catalogo
- `/produto/camiseta-cordis` produto
- `/carrinho` carrinho com localStorage
- `/checkout` checkout com mascara, pedido, doacao e emails transacionais
- `/admin` painel administrativo base

## Organizacao

- `frontend/`: componentes visuais e estado de navegador, incluindo carrinho.
- `backend/`: Prisma, servicos de checkout/doacao/paroquia e emails via Resend.
- `shared/`: catalogo inicial, formatadores e schemas Zod usados pelos dois lados.

As rotas `app/api/*` ficam como adaptadores finos para os servicos de backend.

## Admin

Seed cria:

- e-mail: `admin@rebanho.com`
- senha: `Admin@123`

Por padrao, o admin fica acessivel em desenvolvimento para facilitar criacao visual. Para exigir login, defina `ENFORCE_ADMIN_AUTH=true` no `.env`.

## Deploy sugerido

- Frontend/API: Vercel
- Banco: Neon ou Supabase Postgres
- Imagens: Cloudinary ou S3
- E-mail: Resend
- Pagamento: Stripe ou Mercado Pago

Depois do deploy, configure variaveis de ambiente na Vercel e rode `prisma db push` contra o banco de producao.
