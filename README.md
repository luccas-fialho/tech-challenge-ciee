# Cadastro de Currículos — CIEE

Sistema web para cadastro e consulta de candidatos, com suporte a preenchimento automático via upload de PDF.

## Tecnologias utilizadas

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React | 18.x |
| Build Tool | Vite | 5.x |
| Estilização | Tailwind CSS | 3.x |
| Roteamento | React Router DOM | 6.x |
| Formulários | React Hook Form | 7.x |
| Validação | Zod | 3.x |
| HTTP Client | Axios | 1.x |
| Backend | Node.js | 20.x |
| Framework | Express | 4.x |
| ORM | Prisma | 5.x |
| Banco de dados | SQL Server | 2022 |
| Extração PDF | pdf-parse | 1.x |
| Upload | Multer | 1.x |
| Validação API | express-validator | 7.x |
| Container DB | Docker / Docker Compose | - |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para o SQL Server)
- npm 10+

---

## 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd desafio-tecnico-ciee
```

---

## 2. Configurar o banco de dados (SQL Server via Docker)

### Iniciar o container

```bash
docker-compose up -d
```

Aguarde ~30 segundos para o SQL Server inicializar completamente.

### Verificar se está rodando

```bash
docker-compose ps
```

---

## 3. Configurar o Backend

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com suas credenciais (se diferentes do padrão):

```env
DATABASE_URL="sqlserver://localhost:1433;database=ciee_curriculos;user=sa;password=YourStrong@Passw0rd;trustServerCertificate=true"
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Instalar dependências e criar o banco

```bash
npm install
npx prisma migrate deploy
```

> **Nota:** Se for a primeira vez, use `npx prisma migrate dev --name init` para criar a migration.

### Iniciar o backend

```bash
npm run dev        # desenvolvimento (com nodemon)
# ou
npm start          # produção
```

O backend estará disponível em: **http://localhost:3001**

---

## 4. Configurar o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

> O Vite faz proxy automático de `/api` → `http://localhost:3001`, então não é necessário configurar CORS no desenvolvimento.

---

## 5. Rodar os testes

```bash
cd backend
npm test
# ou
npm test -- --coverage
```

---

## 6. Estrutura do projeto

```
desafio-tecnico-ciee/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo do banco
│   │   └── migrations/         # Migrations geradas
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio
│   │   ├── middlewares/        # Validação e erros
│   │   ├── routes/             # Definição de rotas
│   │   ├── __tests__/          # Testes Jest + Supertest
│   │   ├── prisma.js           # Singleton do PrismaClient
│   │   └── server.js           # Entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── schemas/            # Schemas de validação Zod
│   │   ├── services/           # Chamadas à API
│   │   ├── App.jsx             # Roteamento
│   │   └── main.jsx            # Entrypoint
│   ├── .env
│   └── package.json
├── docker-compose.yml
├── README.md
└── DESENVOLVIMENTO.md
```

---

## 7. Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/candidatos` | Lista todos os candidatos |
| `GET` | `/api/candidatos/:id` | Detalhes de um candidato |
| `POST` | `/api/candidatos` | Cria um novo candidato |
| `POST` | `/api/candidatos/parse-pdf` | Extrai dados de um PDF |

---

## 8. Funcionalidades

- ✅ **Cadastro manual** — formulário com validação client e server-side
- ✅ **Cadastro via PDF** — upload extrai nome, e-mail e telefone automaticamente
- ✅ **Listagem** — tabela de candidatos cadastrados
- ✅ **Detalhes** — tela de visualização completa do candidato
- ✅ **Validações** — campos obrigatórios, formato de e-mail, PDF máx. 5 MB
- ✅ **Mensagens claras** — feedback para todas as situações (sucesso, erro, arquivo inválido)

---

## 9. Limitações da extração de PDF

A extração é baseada em heurísticas simples (regex) e pode não funcionar em todos os currículos. Veja `DESENVOLVIMENTO.md` para mais detalhes.

---

## 10. Exemplos de configuração (sem credenciais reais)

### `.env` do backend
```env
DATABASE_URL="sqlserver://HOST:PORTA;database=NOME_DB;user=USUARIO;password=SENHA;trustServerCertificate=true"
PORT=3001
FRONTEND_URL=http://localhost:5173
```
