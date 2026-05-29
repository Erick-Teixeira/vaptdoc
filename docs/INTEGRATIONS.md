# Integracoes Externas

## iLovePDF

Usado para:

- OCR em PDF
- merge/split/compress
- image to PDF
- page numbers
- watermark
- protect/unlock
- edit
- PDF/A

Variaveis:

```env
ILOVEPDF_PUBLIC_KEY=
ILOVEPDF_SECRET_KEY=
ILOVEPDF_OCR_LANGUAGES=por,eng
```

Fallback:

- quando a API nao esta disponivel, algumas conversoes continuam com motores locais

## Aspose 3D

Usado para:

- conversoes de impressao 3D e formatos 3D

Variaveis:

```env
ASPOSE3D_CLIENT_ID=
ASPOSE3D_CLIENT_SECRET=
```

## ConvertAPI

Usado como suporte opcional para algumas conversoes documentais:

```env
CONVERTAPI_TOKEN=
```

## OCR.Space

Suporte opcional para OCR:

```env
OCR_SPACE_API_KEY=
OCR_SPACE_LANGUAGE=por
```

## Mercado Pago

Usado para:

- checkout
- confirmacao de retorno
- webhook de pagamento

Variaveis:

```env
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
BILLING_STATE_SECRET=
```

## Brevo

Usado para:

- envio de codigo de verificacao de conta
- confirmacao de troca de e-mail
- confirmacao de troca de senha

Preferencia atual:

1. Brevo API
2. SMTP
3. disabled

Variaveis recomendadas:

```env
BREVO_API_KEY=
EMAIL_FROM_ADDRESS=noreply@seudominio.com
EMAIL_FROM_NAME=vaptdoc
```

Fallback SMTP:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

## Observacoes de entrega de e-mail

Nao use remetente `@gmail.com` como endereco transacional de producao.

Use:

- dominio proprio
- remetente profissional
- autenticacao `DKIM` e `DMARC`

## Health checks

O endpoint `/health` expõe o estado resumido de:

- iLovePDF
- Aspose 3D
- Mercado Pago
- e-mail
