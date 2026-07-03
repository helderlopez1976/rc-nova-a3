# RC Nova A3 — Colocar no ar (passo a passo)

App completo: telas + API + banco. Feito pra rodar na Vercel, no seu link.
Não manda e-mail: tudo aparece no sino de notificações do painel.

Você vai fazer 4 coisas: (1) subir o código no GitHub, (2) criar um banco
grátis, (3) publicar na Vercel, (4) inicializar. ~15 minutos.

---

## 1) Subir o código no GitHub

1. Descompacte este zip. Vai ter uma pasta `rc-app`.
2. Em github.com, clique em **New** (novo repositório).
   - Nome: `rc-nova-a3`
   - Deixe **Private**
   - **Não** marque README nem nada. Clique **Create repository**.
3. Na página que abrir, clique em **uploading an existing file**.
4. Arraste **tudo que está DENTRO da pasta `rc-app`** (não a pasta em si —
   o conteúdo: as pastas `app`, `components`, `lib` e os arquivos
   `package.json`, etc). Importante: **não** suba a pasta `node_modules`
   nem `.next` se existirem — o `.gitignore` já cuida disso, mas se
   aparecerem, não precisa subir.
5. Clique **Commit changes**.

## 2) Criar o banco grátis (Neon)

1. Acesse **neon.tech** → **Sign Up** (pode usar o mesmo GitHub).
2. Crie um projeto (nome: `rc-nova-a3`). Região: escolha **AWS / South
   America (São Paulo)** se aparecer, senão qualquer uma.
3. Ao criar, ele mostra uma **Connection String** parecida com:
   `postgresql://usuario:senha@ep-xxxx.neon.tech/neondb?sslmode=require`
4. **Copie essa string inteira.** Você vai colar na Vercel no passo 3.

## 3) Publicar na Vercel

1. Em vercel.com → **Add New… → Project**.
2. Escolha **Import** no repositório `rc-nova-a3` do seu GitHub.
3. Antes de clicar em Deploy, abra **Environment Variables** e adicione
   duas:
   - Nome: `DATABASE_URL` → Valor: a string que você copiou do Neon
   - Nome: `JWT_SECRET` → Valor: qualquer frase longa e secreta
     (ex.: `nova-a3-rc-segredo-troque-2026-xyz`)
4. Clique **Deploy**. Espere ~1 minuto. Ele te dá um link
   `rc-nova-a3.vercel.app`.

## 4) Inicializar o banco (uma vez só)

1. Com o link no ar, acesse no navegador:
   **`https://SEU-LINK.vercel.app/api/seed`**
   (troque SEU-LINK pelo que a Vercel te deu)
2. Vai aparecer uma mensagem confirmando que criou as tabelas e os
   usuários de teste.

Pronto. Agora acesse `https://SEU-LINK.vercel.app` e entre.

---

## Usuários de teste (senha: `nova123`)

| E-mail | O que faz |
|---|---|
| `solicitante@novaa3.com.br` | Abre RC |
| `compras@novaa3.com.br` | Vê o painel, faz o mapa de cotações, escolhe vencedor |
| `financeiro@novaa3.com.br` | Aprova ou reprova a compra |
| `admin@novaa3.com.br` | Vê tudo |

## Como testar o fluxo completo

1. Entre como **solicitante** → **Nova RC** → preencha itens → criar.
2. Saia, entre como **compras** → **Painel** → na RC, clique **Mapa** →
   adicione 2 ou 3 cotações → **Escolher** a melhor (se não for a mais
   barata, ele pede justificativa).
3. Saia, entre como **financeiro** → abra a RC → **Aprovar** ou
   **Reprovar** (reprovar exige motivo).
4. Repare no **sino** 🔔 no topo: as notificações aparecem ali, sem
   e-mail nenhum.

## Observações

- Não construí as "travas" (cadastro de item / geração automática da OC no
  ALTERDATA) nesta versão — é a demonstração do fluxo e do corte de
  e-mail, como combinamos. Dá pra evoluir depois.
- Plano Neon grátis e Vercel Hobby grátis são suficientes pra demonstrar.
- Quando quiser mandar pro Marco, é só passar o link — ou dar acesso ao
  repositório GitHub pra ele fazer o que quiser com o código.
