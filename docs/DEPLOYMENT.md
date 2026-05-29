# Deploy e Ambiente

## Modelo atual

O projeto esta preparado para Railway com:

- `Dockerfile`
- `railway.toml`
- volume persistente `/data`

## Build

```bash
npm run build
```

Esse build:

1. gera assets otimizados em WebP
2. empacota o backend com `tsup`

## Start

```bash
npm start
```

## Volume persistente

Monte um volume em:

```text
/data
```

Isso e importante para:

- SQLite
- sessoes de conta
- billing state persistido

## Variaveis obrigatorias por ambiente

### Minimo local

```env
HOST=0.0.0.0
PORT=3000
DATA_DIR=./data
PUBLIC_APP_URL=http://localhost:3000
ACCESS_TOKEN_SECRET=troque-isto
BILLING_STATE_SECRET=troque-isto
```

### Producao recomendada

```env
NODE_ENV=production
PUBLIC_APP_URL=https://seu-dominio-ou-url
ACCESS_TOKEN_SECRET=...
BILLING_STATE_SECRET=...
DATA_DIR=/data/vaptdoc
ADMIN_OWNER_EMAILS=voce@seudominio.com
```

### Billing real

```env
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
```

### E-mail real

```env
BREVO_API_KEY=
EMAIL_FROM_ADDRESS=noreply@seudominio.com
EMAIL_FROM_NAME=vaptdoc
```

### Conversao premium

```env
ILOVEPDF_PUBLIC_KEY=
ILOVEPDF_SECRET_KEY=
ASPOSE3D_CLIENT_ID=
ASPOSE3D_CLIENT_SECRET=
```

## Health e smoke

Depois do deploy, valide:

```bash
npm run smoke:public
```

E confira:

- `/health`
- `/readyz`
- `/sitemap.xml`
- `/robots.txt`
- uma rota `/ferramenta/...`

## Railway

Fluxo resumido:

1. subir o codigo
2. preencher variaveis
3. anexar volume
4. esperar o deploy
5. validar health

## Compatibilidade

O projeto hoje esta validado com Railway via `Dockerfile`. A maior parte da configuracao e orientada a ambiente e nao depende de estado fora do volume, o que ajuda futuras adaptacoes para outros runtimes.
