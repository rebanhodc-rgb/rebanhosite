# Backend

Camada de servidor da REBANHO.

- `db/`: cliente Prisma e acesso ao banco.
- `services/`: casos de uso como checkout, doacao e busca de paroquia.
- `email/`: templates e envio de emails transacionais via Resend.

As rotas em `app/api/*` devem ficar finas: validar entrada, chamar um servico de backend e devolver JSON.
