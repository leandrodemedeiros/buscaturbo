# Guia de Deploy — BuscaTurbo (Base44 → Supabase + Cloudflare Pages)

## Passo 1 — Configurar o Supabase

### 1.1 Criar as tabelas

1. Acesse [supabase.com](https://supabase.com) → seu projeto
2. Vá em **SQL Editor** → **New query**
3. Cole todo o conteúdo do arquivo `SUPABASE_SETUP.sql` e clique em **Run**

### 1.2 Configurar autenticação (Login com Google)

1. No painel do Supabase, vá em **Authentication** → **Providers** → **Google**
2. Ative o Google Provider
3. Você vai precisar de um **Client ID** e **Client Secret** do Google:
   - Acesse [console.cloud.google.com](https://console.cloud.google.com)
   - Crie um projeto (ou use um existente)
   - Vá em **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Tipo: **Web application**
   - Em **Authorized redirect URIs**, adicione:
     ```
     https://SEU_PROJETO.supabase.co/auth/v1/callback
     ```
   - Copie o Client ID e Secret de volta para o Supabase
4. Em **Authentication** → **URL Configuration**, configure:
   - **Site URL**: `https://seu-app.pages.dev` (ou seu domínio)
   - **Redirect URLs**: adicione `https://seu-app.pages.dev/**`

### 1.3 Configurar o Storage (upload de imagens)

1. Vá em **Storage** → **New bucket**
2. Nome: `uploads`
3. Marque **Public bucket** como ativado
4. Clique em **Create bucket**
5. Vá em **Policies** do bucket `uploads` e adicione estas políticas:

**Para upload (INSERT):**
```sql
-- Apenas usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados fazem upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
```

**Para leitura (SELECT):**
```sql
-- Qualquer pessoa pode ver as imagens
CREATE POLICY "Imagens são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');
```

### 1.4 Pegar as chaves da API

1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** → será seu `VITE_SUPABASE_URL`
   - **anon / public** key → será seu `VITE_SUPABASE_ANON_KEY`

---

## Passo 2 — Configurar o repositório GitHub

1. Crie um repositório no GitHub (pode ser privado)
2. Extraia o ZIP deste projeto e faça o push:
   ```bash
   cd buscaturbo   # pasta do projeto extraído
   git init
   git add .
   git commit -m "Initial commit — migrado do Base44 para Supabase"
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

> ⚠️ O arquivo `.env` **não será enviado** ao GitHub (está no .gitignore). As chaves serão configuradas direto no Cloudflare.

---

## Passo 3 — Deploy no Cloudflare Pages

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Clique em **Pages** → **Connect to Git**
3. Selecione seu repositório GitHub
4. Em **Build settings**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Em **Environment variables**, adicione as duas variáveis:
   | Variable | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` |
6. Clique em **Save and Deploy**

Após o deploy, você receberá uma URL `https://seu-app.pages.dev`. 

> Lembre de voltar ao Supabase → **Authentication** → **URL Configuration** e adicionar essa URL como **Site URL** e em **Redirect URLs**.

---

## Passo 4 — Testar

1. Acesse a URL do Cloudflare Pages
2. Verifique se a listagem de veículos carrega (pode estar vazia no início)
3. Tente fazer login com Google
4. Tente criar um anúncio com upload de imagem

---

## Estrutura de arquivos modificados

```
src/
├── lib/
│   ├── supabase.js       ← NOVO: cliente do Supabase
│   ├── db.js             ← NOVO: substituto do SDK Base44
│   └── AuthContext.jsx   ← MODIFICADO: usa Supabase Auth
├── api/
│   └── base44Client.js   ← MODIFICADO: re-exporta db.js
vite.config.js             ← MODIFICADO: plugin Base44 removido
package.json               ← MODIFICADO: @supabase adicionado, @base44 removido
.env.example               ← NOVO: template das variáveis de ambiente
SUPABASE_SETUP.sql         ← NOVO: schema do banco
DEPLOY_GUIDE.md            ← NOVO: este guia
```
