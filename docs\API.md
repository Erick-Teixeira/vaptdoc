# API do `vaptdoc`

Base local:

```text
http://localhost:3000
```

Base producao:

```text
https://transmutalab.up.railway.app
```

## Endpoints publicos

### `GET /health`

Retorna status do servico, limites e integracoes:

```json
{
  "status": "ok",
  "service": "vaptdoc",
  "timestamp": "2026-05-29T00:00:00.000Z",
  "limits": {
    "maxFileSizeMB": 50,
    "maxConcurrentConversions": 3,
    "maxPendingConversions": 12
  },
  "integrations": {
    "ilovePdf": {},
    "aspose3d": {},
    "mercadopago": {},
    "email": {}
  }
}
```

### `GET /readyz`

Retorna readiness operacional da fila de conversao.

### `GET /api/tools`

Lista as ferramentas, seus formatos, hints e limites.

### `GET /api/access/session`

Retorna o estado de acesso premium/gratuito do navegador.

### `GET /api/account/session`

Retorna a sessao autenticada da conta do usuario.

### `GET /api/account/avatar`

Retorna o avatar atual do usuario autenticado.

## Conta

### `POST /api/account/register`

Cria um challenge de verificacao por e-mail.

```json
{
  "displayName": "Erick",
  "email": "erick@exemplo.com",
  "password": "senha-forte"
}
```

### `POST /api/account/register/confirm`

Confirma o codigo e cria a conta.

```json
{
  "verificationId": "uuid",
  "code": "123456"
}
```

### `POST /api/account/verification/resend`

Reenvia o codigo.

### `POST /api/account/login`

Realiza login da conta.

### `PATCH /api/account/profile`

Atualiza dados simples do perfil.

### `POST /api/account/profile/email`

Solicita troca de e-mail e envia codigo para o novo endereco.

### `POST /api/account/profile/confirm`

Confirma a troca de e-mail.

### `POST /api/account/password`

Solicita troca de senha via codigo.

### `POST /api/account/password/confirm`

Confirma a troca de senha.

### `POST /api/account/avatar`

Atualiza avatar.

### `DELETE /api/account/avatar`

Remove avatar.

### `POST /api/account/logout`

Encerra a sessao da conta.

## Billing

### `POST /api/billing/checkout`

Cria uma sessao de checkout.

```json
{
  "offerId": "pro-monthly"
}
```

### `POST /api/billing/confirm-return`

Confirma o retorno do checkout e sincroniza plano.

### `POST /api/billing/mercadopago/webhook`

Webhook do Mercado Pago.

## Access

### `POST /api/access/redeem`

Ativa codigo promocional ou de acesso.

### `POST /api/access/logout`

Encerra sessao premium do navegador.

## Conversao

### `POST /api/convert`

Endpoint multipart para conversao.

Campos:

- `toolId`
- `file`
- opcionalmente:
  - `textLayout`
  - campos dinamicos da ferramenta

Exemplo conceitual:

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "X-Vaptdoc-Client: web" \
  -F "toolId=pdf-to-text" \
  -F "file=@arquivo.pdf"
```

## Painel admin

### Dashboard

- `GET /api/admin/dashboard`

### Usuarios

- `GET /api/admin/users`
- `GET /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/profile`
- `POST /api/admin/users/:userId/plan`
- `POST /api/admin/users/:userId/credits`
- `POST /api/admin/users/:userId/discount`
- `DELETE /api/admin/users/:userId`

### Promocoes

- `GET /api/admin/promos`
- `POST /api/admin/promos`
- `PATCH /api/admin/promos/:code`
- `DELETE /api/admin/promos/:code`

## Seguranca de mutacoes

Rotas mutaveis exigem:

- request interna do frontend com header validado
- cookies/sessoes corretos
- validacao Zod
- limites de rate limit por rota
