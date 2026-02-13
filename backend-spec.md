# Backend Specification & Architecture | Portfolio Diogo Luna (v2.0)

> **Repository:** `portfolio-api`
> **Role:** Serverless API Gateway & Data Orchestrator.
> **Focus:** Specifications, Data Contracts, and Infrastructure Design.

---

## 1. High-Level Architecture

O backend opera em modelo **Serverless Event-Driven**, garantindo escalabilidade automática e custo sob demanda.

* **Runtime Environment:** AWS Lambda (Node.js 20.x).
* **Infrastructure as Code (IaC):** SST (Serverless Stack).
* **API Framework:** Hono (Edge/Lambda optimized).
* **Data Sources:**
    * **Structured Data:** Amazon DynamoDB (Certificates, Formations, Projects).
    * **Unstructured Data (RAG):** Upstash Vector (Embeddings gerados a partir do DynamoDB + Profile).
    * **Static Data:** JSON (Profile settings, social links).
* **Intelligence:** Groq API (LLM Inference).

---

## 2. Database Schema Specification (DynamoDB)

O sistema deve conectar-se a tabelas DynamoDB para recuperar todo o conteúdo dinâmico do portfólio.

### 2.1. Table: `certificates`
Armazena cursos livres, bootcamps e certificações técnicas.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** (PK) | `Number` | Identificador único do certificado. |
| **categoryCode** | `String` | Código para agrupar (ex: "CLOUD", "DEV", "LANG"). |
| **certificateUrl** | `String` | URL pública (PDF ou Credencial externa). |
| **courseName** | `String` | Nome do curso realizado. |
| **finishedAt** | `String (ISO)` | Data de conclusão. |
| **imageUrl** | `String` | URL da logo da tecnologia ou instituição. |
| **startedAt** | `String (ISO)` | Data de início. |

### 2.2. Table: `formations`
Armazena graduações acadêmicas e formações de longa duração.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** (PK) | `Number` | Identificador único da formação. |
| **name** | `String` | Nome da graduação (ex: "Sistemas de Informação"). |
| **area** | `String` | Área de conhecimento (ex: "Exatas", "Tecnologia"). |
| **certificate** | `String` | URL do diploma ou comprovante. |
| **conclusion** | `String (ISO)` | Data de conclusão (ou previsão). |
| **materias** | `List<String>` | Lista de principais disciplinas cursadas. |

### 2.3. Table: `projects`
Armazena os estudos de caso, focando em arquitetura e documentação técnica.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| **id** (PK) | `String` | Slug único do projeto (ex: "api-drinks", "segmedic-core"). |
| **title** | `String` | Nome de exibição do projeto. |
| **shortDescription** | `String` | Resumo para o card (chamada para ação). |
| **fullDescription** | `String` | Descrição técnica completa (suporta Markdown). |
| **architectureUrl** | `String` | URL da imagem do Diagrama de Arquitetura (Foco do portfólio). |
| **coverUrl** | `String` | Imagem de capa/preview. |
| **techStack** | `List<String>` | Lista de tecnologias (ex: ["AWS", "Node.js", "Docker"]). |
| **repoUrl** | `String` | Link para o GitHub (pode ser null se for privado). |
| **liveUrl** | `String` | Link para o projeto em produção (opcional). |
| **isFeatured** | `Boolean` | Se `true`, aparece em destaque na Home. |
| **priority** | `Number` | Ordem de classificação na lista. |

---

## 3. RAG & AI Specification

Especificação do motor de Inteligência Artificial para o Chatbot.

### 3.1. Knowledge Base (Ingestion Pipeline)
O pipeline de ingestão deve ser híbrido:
* **Source 1 (DynamoDB):** Um script agendado (Cron Lambda) deve ler a tabela `projects`, converter as descrições e stacks em texto e gerar embeddings.
* **Source 2 (Static Files):** Lê arquivos locais (`profile.md`) para dados biográficos que não mudam com frequência.
* **Vector Database:** Upstash Vector.

### 3.2. Inference Flow
1.  **Input:** Usuário envia mensagem via POST `/chat`.
2.  **Retrieval:** Backend busca vetores relevantes no Upstash (que agora contém dados dos projetos do DynamoDB).
3.  **Synthesis:** Backend monta o prompt com o contexto recuperado.
4.  **Generation:** Envia para Groq API (`llama3-8b`).
5.  **Output:** Retorna resposta contextualizada.

---

## 4. API Endpoints Specification

Definição dos contratos de entrada e saída (JSON).

### 4.1. Domain: Public Profile & Status

#### `GET /profile`
Retorna os dados estáticos do perfil.
* **Response:** Objeto contendo `name`, `role`, `location`, `summary`, `socialLinks`.

#### `GET /status`
Dashboard de saúde do sistema.
* **Response:** `{ api: "online", lastCommit: Date, codingNow: boolean }`.

### 4.2. Domain: Education (DynamoDB)

#### `GET /certificates`
Lista todos os certificados.
* **Query Params:** `?category=CLOUD`
* **Logic:** Scan `certificates` table. Sort by `finishedAt` DESC.
* **Response:** Array de objetos `Certificate`.

#### `GET /formations`
Lista as formações.
* **Logic:** Scan `formations` table.
* **Response:** Array de objetos `Formation`.

### 4.3. Domain: Projects (DynamoDB)

#### `GET /projects`
Lista todos os projetos.
* **Query Params:**
    * `?featured=true` (Retorna apenas os destaques para a Home).
* **Logic:** Scan `projects` table. Sort by `priority` ASC.
* **Response:** Array de objetos `Project`.

#### `GET /projects/:id`
Retorna detalhes de um projeto específico.
* **Logic:** GetItem na tabela `projects` usando o `id` (slug).
* **Response:** Objeto único `Project` com `fullDescription`.

### 4.4. Domain: AI Chat

#### `POST /chat`
Endpoint de interação com o assistente.
* **Request Body:** `{ "message": "string" }`
* **Response:** `{ "reply": "string", "sources": ["project:api-drinks", "profile"] }`

---

## 5. Security & Infrastructure Requirements

### 5.1. Authentication & Access
* **Public API:** Leitura pública.
* **Write Access:** Escrita nas tabelas DynamoDB feita apenas via AWS Console ou Scripts de Seed (Admin). A API não expõe rotas POST/PUT para dados, apenas para Chat.

### 5.2. AWS Permissions (IAM)
A Lambda deve ter permissões:
* `dynamodb:Scan`, `dynamodb:Query`, `dynamodb:GetItem` nas tabelas `certificates`, `formations` e `projects`.
* Permissão de leitura de Secrets (SSM Parameter Store) para chaves de API.

### 5.3. Rate Limiting
* Implementar Throttling no API Gateway para proteger o endpoint `/chat` e evitar custos excessivos com IA (mesmo que Groq seja free tier, é boa prática).