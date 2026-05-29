# Contribuindo com o `vaptdoc`

Obrigado por querer melhorar o projeto.

## Fluxo recomendado

1. Fork ou branch a partir da base principal
2. Instale dependencias
3. Configure `.env`
4. Rode a suite local
5. Faça mudancas pequenas e coesas
6. Adicione testes
7. Abra um PR com contexto claro

## Setup rapido

```bash
npm install
cp .env.example .env
npm run dev
```

## Validacoes obrigatorias

```bash
npm run lint
npm test
npm run build
```

## Convencoes

- TypeScript no backend
- frontend sem framework
- validacao forte com Zod
- erros sem vazar detalhes sensiveis
- uploads sempre com validacao de tipo e tamanho
- novas integracoes devem ser encapsuladas em `src/services`

## Onde mexer

- nova ferramenta: `src/catalog.ts` + `src/services/conversion-service.ts`
- nova rota: `src/routes/api.ts`
- novo estado de UI: `public/app.js`
- novo estilo: `public/styles.css`
- nova documentacao: `docs/`

## Testes

Adicione ou atualize:

- teste unitario da regra de negocio
- teste de rota se a API mudou
- smoke publico se a mudanca impacta comportamento externo

## Pull requests

Explique no PR:

- problema
- mudanca feita
- risco/regressao
- testes executados

## Responsabilidade com segredos

Nao suba:

- `.env`
- chaves reais
- bancos SQLite reais
- dumps de pagamento
