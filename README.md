# Caderno de Receitas

App web em português: receitas de comida, dicas de saúde e sabão artesanal, com login (e-mail e senha, com olho para mostrar/ocultar), favoritos e **assinatura mensal Premium via Mercado Pago**.

**Stack:** React 18 + Vite + TypeScript + Tailwind + Supabase (Auth, Postgres, Edge Functions). É o mesmo stack do Lovable: dá para importar este repositório pelo GitHub.

## Planos
- **Grátis:** vê o catálogo (título, categoria, nível, tempo) e a página de planos.
- **Premium (mensal):** abre receitas, vídeos, fontes e favoritos. Regra aplicada no **banco** (RLS), não só na tela.

## Telas e rotas

| Rota | Acesso | O que é |
|---|---|---|
| `/entrar`, `/cadastrar`, `/esqueci-senha` | público | login, cadastro (com confirmar senha), recuperação |
| `/redefinir-senha` | link do e-mail | define nova senha |
| `/` | logado | catálogo por abas + busca |
| `/planos` | logado | Grátis x Premium, botão "Assinar" |
| `/assinatura` | logado | status, próxima cobrança, cancelar |
| `/assinatura/retorno` | logado | volta do Mercado Pago, confirma o pagamento |
| `/item/:id`, `/favoritos` | logado + Premium | detalhe com vídeo, favoritos |

Edge Functions: `create-subscription`, `sync-subscription`, `cancel-subscription`, `mp-webhook` (público, valida `x-signature`).

## Como rodar

### 1. Supabase
1. Crie um projeto em supabase.com.
2. No **SQL Editor**, rode na ordem: `supabase/migrations/001_schema.sql` e depois `002_seed.sql` (30 itens).
3. Em **Authentication > URL Configuration**, coloque a URL do app em *Site URL* e adicione `https://SEU-APP/redefinir-senha` em *Redirect URLs*.
4. Instale a CLI do Supabase e publique as funções:
   ```bash
   supabase link --project-ref SEU_PROJETO
   supabase secrets set MP_ACCESS_TOKEN=... MP_WEBHOOK_SECRET=... APP_URL=https://SEU-APP SUBSCRIPTION_PRICE_BRL=19.90
   supabase functions deploy create-subscription sync-subscription cancel-subscription mp-webhook
   ```
   (`supabase/config.toml` já deixa o `mp-webhook` sem JWT.)

### 2. Mercado Pago
1. mercadopago.com.br/developers → **Suas integrações** → criar aplicação.
2. Use primeiro o **Access Token de teste** e **usuários de teste** (vendedor e comprador).
3. **Webhooks:** URL `https://SEU_PROJETO.supabase.co/functions/v1/mp-webhook`, evento **Planos e assinaturas**. Copie a assinatura secreta para `MP_WEBHOOK_SECRET`.
4. O `APP_URL` precisa ser HTTPS (o Mercado Pago exige no retorno).

### 3. Front-end
```bash
cp .env.example .env     # preencha URL e chave anon do Supabase
npm install
npm run dev
```
Build: `npm run build`.

## Atenção antes de cobrar clientes
- O fluxo de assinatura **não foi testado contra o Mercado Pago real** nesta entrega. Teste no sandbox: assinar, retorno, webhook mudando `subscriptions.status` para `authorized`, cancelar.
- O preço cobrado vem do servidor (`SUBSCRIPTION_PRICE_BRL`). `VITE_PRICE_DISPLAY` só exibe o valor na tela; mantenha os dois iguais.
- A assinatura recorrente do Mercado Pago é no cartão (sem Pix recorrente nesse modelo).
- Cancelar mantém o acesso até a próxima data de cobrança já paga.
- Receitas de sabão com soda cáustica: o app exige o aceite dos avisos de segurança; valide as quantidades numa calculadora de saponificação antes de divulgar. A receita de processo a frio está sem quantidades de propósito.
- Os vídeos do YouTube foram lidos de páginas de terceiros; confira cada link. O conteúdo está em `docs/conteudo.json` (fonte de cada item no campo `source_url`). Revise direitos/uso de conteúdo de terceiros antes de monetizar.
- Dicas de saúde: conteúdo informativo, não substitui orientação médica.

## Seed
`supabase/migrations/002_seed.sql` é gerado de `docs/conteudo.json` e faz *upsert* (pode rodar de novo).
