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
- CSRF assinado para mutacoes de API
- verificacao de origem para mutacoes sensiveis
- protecao anti-bot opcional com Cloudflare Turnstile em cadastro e login
- bloqueio progressivo contra tentativa de login por e-mail/IP
- elevacao temporaria para acoes administrativas sensiveis
- webhook assinado para Mercado Pago
- trilha administrativa no backend
- healthcheck publico minimo e diagnostico detalhado apenas para admin
- backups criptografados com verificacao de integridade

## Pilares

### Uploads

- tipos e tamanhos devem ser validados no backend
- nunca confiar apenas no MIME do navegador
- evitar processar arquivos vazios
- validar dimensoes de imagens antes de enviar para motores pesados
- rejeitar arquivos empacotados com excesso de entradas ou alta taxa de expansao
- usar `MALWARE_SCAN_BIN` quando houver scanner disponivel no ambiente

### Conta

- troca de e-mail e senha exigem confirmacao por codigo
- sessoes devem ser invalidadas de forma segura
- admin owner deve continuar protegido por `ADMIN_OWNER_EMAILS`
- mutacoes comuns devem exigir CSRF e origem valida
- cadastro e login podem exigir Turnstile com `TURNSTILE_REQUIRED=true`
- falhas repetidas de login devem permanecer bloqueadas pelo `SecurityService`
- acoes administrativas criticas devem pedir reautenticacao recente
- contas criadas pelo administrador continuam seguindo o fluxo de produto definido; nao adicionar convite obrigatorio sem decisao explicita

### Billing

- webhooks devem ser verificados
- nunca liberar plano apenas por callback de frontend
- confirmar pagamento no backend

### Backups

- backups de dados persistentes devem ser criptografados com `BACKUP_ENCRYPTION_KEY`
- a chave de backup deve ser forte e diferente de `ACCESS_TOKEN_SECRET` e `BILLING_STATE_SECRET`
- restauracoes devem validar integridade e impedir escrita fora do diretorio alvo

### Logs

- logs devem ser estruturados
- nao registrar segredos
- nao registrar arquivos inteiros nem payloads sensiveis
- nao expor stack trace, token, webhook secret, cookie ou chave de backup em avisos de interface

## Relato responsavel

Se encontrar uma vulnerabilidade:

1. nao abra issue publica com exploit detalhado
2. relate ao mantenedor em canal privado
3. inclua:
   - impacto
   - passos de reproducao
   - area afetada
