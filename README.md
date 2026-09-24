# FoodRescue — Web

Frontend do FoodRescue: conecta estabelecimentos (padarias, restaurantes,
mercados, lanchonetes) com produtos perto do vencimento a consumidores. O
backend fica em [foodrescue-api](https://github.com/AOBarbosa/foodrescue-api).

## Rodando localmente

Pré-requisitos: Node.js 20.9+ (CI usa 24) e o backend rodando em
`http://localhost:8080`.

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, padrão http://localhost:8080
npm install
npm run dev                  # http://localhost:3000
```

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run lint` | ESLint |
| `npm run typecheck` | gera os tipos de rota do Next e roda `tsc --noEmit` |
| `npm test` | Vitest + React Testing Library |
| `npm run build` | build de produção |

## O que existe hoje (Sprint 1)

| UC | Tela | Rota |
|---|---|---|
| UC01 | Cadastro e login de estabelecimento | `/establishment/register`, `/establishment/login` |
| UC01 | Listagem pública de estabelecimentos | `/establishments` |
| UC01 | Perfil: ver, editar, excluir a própria conta | `/dashboard/profile` |
| UC02 | Cadastro, listagem e detalhe de produtos | `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]` |
| UC03 | Atualização de estoque e validade | formulário em `/dashboard/products/[id]` |

UC04 em diante só ganham tela quando a API correspondente existir no backend.

## Stack

Next.js 16 (App Router) · TypeScript strict · MUI 9 · Tailwind CSS 4 (só
utilitários, sem preflight) · Axios · TanStack Query · react-hook-form + zod ·
Vitest + React Testing Library.

## Arquitetura

```
app/
  (public)/            landing e listagem pública de estabelecimentos
  (establishment)/     login/cadastro e painel (/dashboard/*) do estabelecimento
  (consumer)/          reservado para a jornada do consumidor (Sprint 3)
components/
  ui/                  o que o MUI não cobre (EmptyState, PageHeader, ...)
  layout/              cabeçalhos e shell do painel
  establishment/       um componente por caso de uso (formulários, perfil, lista)
  product/
hooks/                 um hook TanStack Query por operação
lib/
  api/client.ts        a única instância do Axios
  api/<recurso>.ts     uma função por endpoint (a única camada que conhece rotas HTTP)
  auth/                sessão (cookie) e constantes de rota
  forms/               mapeamento de erros do backend para os campos
schemas/               schemas zod espelhando as validações do backend
types/                 tipos espelhando os DTOs do backend
proxy.ts               guarda de /dashboard (antigo middleware.ts no Next 16)
```

Componentes dependem de hooks, hooks dependem de `lib/api/*`, e só
`lib/api/client.ts` importa o Axios.

### Erros

Todo endpoint devolve o envelope `ApiResponse`. O interceptor de resposta
converte qualquer falha num `AppError` (`status`, `code`, `subErrors`). Os
formulários usam `applyServerErrors` para colocar cada `subError` no campo
correspondente (ex.: CNPJ duplicado aparece no campo CNPJ), e o que não tem
campo vira um alerta no formulário. As mensagens em pt-BR ficam em
`lib/api/errorMessages.ts`.

### Autenticação

O token JWT e o perfil devolvidos por cadastro/login ficam em cookies legíveis
por JS (`fr_token`, `fr_session`). O JWT nunca é decodificado no frontend. O
`proxy.ts` redireciona `/dashboard/*` para o login quando não há token. Um `401`
numa requisição autenticada encerra a sessão e volta ao login com aviso de
sessão expirada. Para trocar a estratégia (ex.: localStorage), basta mudar
`lib/auth/session.ts`.

## Contribuição

Veja [CONTRIBUTING.md](CONTRIBUTING.md): `develop` como integração,
`main` estável, branches `feature/uc0X-<slug>`, CI obrigatório.
