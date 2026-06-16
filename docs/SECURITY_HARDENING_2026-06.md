# Relatorio de Hardening de Seguranca - Junho/2026

## Escopo

Esta revisao focou em proteger usuarios, administracao e backend sem alterar o fluxo de contas criadas manualmente pelo administrador.

Areas revisadas:

- autenticacao e sessoes
- CSRF e validacao de origem
- protecao anti-bot
- rotas administrativas
- endpoints publicos
- uploads e processamento externo
- segredos e variaveis de ambiente
- backups
- monitoramento operacional

## Achados tratados

### SEC-001 - Mutacoes sem protecao CSRF/origem

Controle implementado:

- `SecurityService` gera token CSRF assinado.
- Frontend envia `X-CSRF-Token` em chamadas mutaveis same-origin.
- Backend rejeita mutacoes com origem invalida ou token ausente/invalido.
- Webhook do Mercado Pago continua isento porque usa verificacao propria.

Arquivos principais:

- `src/services/security-service.ts`
- `src/app.ts`
- `public/app.js`

### SEC-002 - Tentativas repetidas de login

Controle implementado:

- Rastreamento por e-mail/IP em `auth_attempts`.
- Bloqueio temporario configuravel por `LOGIN_FAILURE_LIMIT` e `LOGIN_LOCK_MINUTES`.
- Sucesso de login limpa o historico de falhas.
- Turnstile opcional em cadastro e login.

Arquivos principais:

- `src/services/security-service.ts`
- `src/routes/api.ts`
- `public/index.html`
- `public/app.js`

### SEC-003 - Acoes administrativas sensiveis sem reautenticacao recente

Controle implementado:

- Nova rota `POST /api/admin/reauth`.
- Mutacoes administrativas sensiveis exigem cookie de elevacao temporaria.
- Elevacao fica vinculada ao usuario e a sessao atual.
- O fluxo de criacao de contas por administrador foi preservado conforme decisao de produto.

Arquivos principais:

- `src/routes/api.ts`
- `src/services/security-service.ts`
- `public/app.js`

### SEC-004 - Endpoints publicos com excesso de informacao operacional

Controle implementado:

- `/health` publico agora retorna somente status minimo.
- Diagnostico detalhado foi movido para `/api/admin/system/health`.
- `/documentation/json` fica protegido em producao.

Arquivos principais:

- `src/app.ts`

### SEC-005 - Uploads e arquivos pesados com risco de abuso

Controle implementado:

- Validacao adicional de imagens com limite de pixels.
- Inspecao de arquivos ZIP/Office para quantidade de entradas e taxa de expansao.
- Suporte a scanner externo por `MALWARE_SCAN_BIN`.
- Modo fail-closed com `MALWARE_SCAN_REQUIRED=true`.

Arquivos principais:

- `src/utils/file-validation.ts`
- `src/routes/api.ts`
- `src/env.ts`

### SEC-006 - Processos externos com saida ilimitada

Controle implementado:

- `runCommand` agora limita o volume total de stdout/stderr.
- Processos sao encerrados ao exceder o limite.

Arquivos principais:

- `src/utils/process.ts`

### SEC-007 - Segredos fracos ou reutilizados em producao

Controle implementado:

- Inicializacao de producao falha se secrets criticos estiverem ausentes, fracos, fallback ou reutilizados.
- Novas variaveis sensiveis foram centralizadas em `src/env.ts` e `.env.example`.
- Logs e avisos nao devem expor credenciais ou tokens.

Arquivos principais:

- `src/app.ts`
- `src/env.ts`
- `.env.example`

### SEC-008 - Backup sem criptografia verificavel

Controle implementado:

- Backups com AES-256-GCM.
- Manifesto criptografado e hashes SHA-256 por arquivo.
- Restauracao valida integridade e impede path traversal.

Arquivos principais:

- `scripts/backup-lib.mjs`
- `scripts/backup-data.mjs`
- `scripts/verify-backup.mjs`
- `scripts/restore-backup.mjs`

## Variaveis novas ou relevantes

```env
ADMIN_SESSION_HOURS=
ADMIN_ELEVATION_MINUTES=
LOGIN_FAILURE_LIMIT=
LOGIN_LOCK_MINUTES=
SECURITY_ALLOWED_ORIGINS=
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_ALLOWED_HOSTNAMES=
TURNSTILE_REQUIRED=
BACKUP_ENCRYPTION_KEY=
MALWARE_SCAN_BIN=
MALWARE_SCAN_REQUIRED=
MAX_IMAGE_PIXELS=
MAX_ARCHIVE_ENTRIES=
MAX_ARCHIVE_RATIO=
```

## Validacao executada

Comandos executados localmente:

```bash
npm run lint
npm test
node --check public/app.js
node --check scripts/backup-lib.mjs
node --check scripts/backup-data.mjs
node --check scripts/verify-backup.mjs
node --check scripts/restore-backup.mjs
npm run build
```

Resultado:

- TypeScript sem erros.
- Sintaxe do frontend e scripts de backup sem erros.
- Vitest: 16 arquivos, 91 testes aprovados.
- Build de producao concluido com sucesso.

## Observacoes operacionais

- Para ativar Turnstile em producao, configure `TURNSTILE_REQUIRED=true` e as chaves oficiais do Cloudflare.
- Para exigir antivirus, configure `MALWARE_SCAN_REQUIRED=true` somente depois de instalar e apontar `MALWARE_SCAN_BIN`.
- Para backups reais, defina `BACKUP_ENCRYPTION_KEY` forte e exclusiva.
- `PUBLIC_APP_URL` ou `SECURITY_ALLOWED_ORIGINS` precisa refletir o dominio publico final em producao.
