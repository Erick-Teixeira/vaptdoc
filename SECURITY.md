# Seguranca

## Objetivo

Este documento resume a postura atual de seguranca do `vaptdoc` e orienta contribuidores a nao enfraquecer protecoes existentes.

## Controles principais

- `helmet` com CSP
- rate limit
- validacao de payload com Zod
- validacao forte de upload e limite de tamanho
- sanitizacao de nome de arquivo
- cookie/session hardening
- verificacao de origem para mutacoes sensiveis
- webhook assinado para Mercado Pago
- trilha administrativa no backend

## Pilares

### Uploads

- tipos e tamanhos devem ser validados no backend
- nunca confiar apenas no MIME do navegador
- evitar processar arquivos vazios

### Conta

- troca de e-mail e senha exigem confirmacao por codigo
- sessoes devem ser invalidadas de forma segura
- admin owner deve continuar protegido por `ADMIN_OWNER_EMAILS`

### Billing

- webhooks devem ser verificados
- nunca liberar plano apenas por callback de frontend
- confirmar pagamento no backend

### Logs

- logs devem ser estruturados
- nao registrar segredos
- nao registrar arquivos inteiros nem payloads sensiveis

## Relato responsavel

Se encontrar uma vulnerabilidade:

1. nao abra issue publica com exploit detalhado
2. relate ao mantenedor em canal privado
3. inclua:
   - impacto
   - passos de reproducao
   - area afetada
