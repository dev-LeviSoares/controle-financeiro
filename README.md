# API Controle Financeiro

API REST de controle financeiro com **Node.js**, **Express**, **PostgreSQL**, **Prisma** e autenticação **JWT**.

Arquitetura em camadas: `routes → controllers → services → repositories → Prisma`.

## Credenciais do banco (`.env`)

O arquivo `.env` já foi gerado com:

| Item | Valor |
|------|-------|
| Usuário | `controle_user` |
| Senha | `IE2a1fKi47DcPcPtEGhpiYaK` |
| Banco | `controle_financeiro` |
| Host | `localhost:5432` |
| `DATABASE_URL` | `postgresql://controle_user:IE2a1fKi47DcPcPtEGhpiYaK@localhost:5432/controle_financeiro?schema=public` |

### Subir o banco com Docker

```bash
cd Controle-financeiro
docker compose up -d
```

Isso sobe o PostgreSQL na porta `5432` com as mesmas credenciais do `.env`.

Para parar:

```bash
docker compose down
```

Para apagar também os dados do volume:

```bash
docker compose down -v
```

### Alternativa sem Docker

Crie o banco manualmente (como superusuário do PostgreSQL):

```sql
CREATE USER controle_user WITH PASSWORD 'IE2a1fKi47DcPcPtEGhpiYaK';
CREATE DATABASE controle_financeiro OWNER controle_user;
GRANT ALL PRIVILEGES ON DATABASE controle_financeiro TO controle_user;
```

No PostgreSQL 15+, conecte no banco criado e libere o schema:

```sql
\c controle_financeiro
GRANT ALL ON SCHEMA public TO controle_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO controle_user;
```

## Como rodar

```bash
cd Controle-financeiro
docker compose up -d
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

A API sobe em `http://localhost:3000`.

### Admin inicial (seed)

- **email:** `admin@controle.local`
- **senha:** `admin123`

## Entidades e relacionamentos

1. **User** — usuários com perfil `ADMIN` ou `USER`
2. **Category** — categorias de receita/despesa (`INCOME` / `EXPENSE`)
3. **Transaction** — lançamentos financeiros

Relacionamentos:

- Um usuário possui várias categorias (1:N)
- Um usuário possui várias transações (1:N)
- Uma categoria possui várias transações (1:N)

## Autenticação e autorização

- `POST /auth/register` — cadastro público sempre cria perfil `USER`
- `POST /auth/login` — retorna JWT
- Endpoints protegidos exigem header: `Authorization: Bearer <token>`
- `ADMIN` pode listar usuários e ver todos os recursos
- `USER` acessa apenas seus próprios recursos

## Endpoints

### Auth

| Método | Rota | Acesso |
|--------|------|--------|
| POST | `/auth/register` | público |
| POST | `/auth/login` | público |

### Users

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/users` | ADMIN |
| GET | `/users/:id/transactions` | ADMIN ou o próprio usuário |

### Categories (CRUD)

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/categories` | autenticado |
| GET | `/categories/:id` | autenticado |
| POST | `/categories` | autenticado |
| PUT | `/categories/:id` | autenticado |
| DELETE | `/categories/:id` | autenticado |

### Transactions (CRUD)

| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/transactions/me` | autenticado (próprias) |
| GET | `/transactions` | autenticado |
| GET | `/transactions/:id` | autenticado |
| POST | `/transactions` | autenticado |
| PUT | `/transactions/:id` | autenticado |
| DELETE | `/transactions/:id` | autenticado |

## Exemplos de body

Cadastro:

```json
{
  "name": "Maria",
  "email": "maria@email.com",
  "password": "senha123"
}
```

Login:

```json
{
  "email": "maria@email.com",
  "password": "senha123"
}
```

Categoria:

```json
{
  "name": "Salário",
  "type": "INCOME"
}
```

Transação:

```json
{
  "description": "Salário mensal",
  "amount": 3500.00,
  "type": "INCOME",
  "categoryId": "id-da-categoria",
  "date": "2026-11-01T00:00:00.000Z"
}
```

## Regras de negócio

1. Valor da transação deve ser maior que zero.
2. Tipo da transação deve coincidir com o tipo da categoria.
3. Não é possível excluir categoria com transações vinculadas (HTTP 409).
4. Usuário comum só opera nos próprios registros (HTTP 403).

## Fluxo das camadas

1. **Route** — recebe a requisição e aplica middlewares (`authenticate` / `authorize`)
2. **Controller** — extrai dados HTTP e devolve status/JSON
3. **Service** — valida regras de negócio e permissões
4. **Repository** — acessa o PostgreSQL via Prisma
5. **Prisma (Model)** — mapeia entidades e relacionamentos

## Scripts

| Script | Descrição |
|--------|-----------|
| `npm run dev` | sobe o servidor com watch |
| `npm start` | sobe o servidor |
| `npm run prisma:migrate` | cria/aplica migrations |
| `npm run prisma:seed` | cria o admin inicial |
| `npm run prisma:generate` | gera o Prisma Client |
