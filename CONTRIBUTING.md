# Fluxo de branches e contribuição

Mesmo fluxo do backend ([foodrescue-api](https://github.com/AOBarbosa/foodrescue-api/blob/main/CONTRIBUTING.md)).

## Branches

- `main` — branch estável/de release. Só recebe atualizações via merge de `develop`. Nunca recebe push direto nem PR de outra branch.
- `develop` — branch de integração. É o alvo (`base`) dos Pull Requests de todas as issues.
- Branches de feature/issue — criadas a partir de `develop`, nomeadas `feature/uc0X-<slug>` (ex.: `feature/uc04-registrar-venda`), com PR de volta para `develop`.

Promoção de `develop` para `main` é feita por PR (`develop` → `main`); nenhuma outra branch pode ser a origem de um PR para `main` (verificado automaticamente pelo workflow `Guard main branch`).

## Issues

Uma issue por caso de uso, com a mesma numeração do backend (`[UC01] ...`, `[UC02] ...`), para rastrear "a tela de UC02 cobre a API de UC02 do backend". Uma tela só é construída quando a API correspondente já existe no backend.

## Pull Requests

- Nenhum push direto é aceito em `main` ou `develop` — toda mudança entra via PR.
- O PR só pode ser mergeado se o pipeline de CI (`Lint, typecheck, test and build`) estiver verde.
- PRs para `main` só podem ter `develop` como branch de origem.

## Testes

- Toda issue de caso de uso exige testes (Vitest + React Testing Library) cobrindo o fluxo principal e os fluxos alternativos/erros de negócio descritos na issue — schemas zod, hooks (com `QueryClient` de teste) e componentes de formulário/feature.
- O pipeline de CI roda `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` em todo push/PR para `main` e `develop`.
