# Portfolio v2 Backend - Serverless API

API REST serverless desenvolvida com AWS Lambda + API Gateway HTTP + DynamoDB para gerenciamento de conteúdo do portfolio.

## 🏗️ Arquitetura

- **Runtime**: Node.js 20.x (ARM64/Graviton2)
- **API Gateway**: HTTP API (otimizado para custo)
- **Database**: DynamoDB (On-Demand billing)
- **IaC**: Terraform
- **Framework**: AWS SDK v3 + Zod
- **Pattern**: Consolidated Lambda Handlers (1 Lambda per resource)

## 📦 Recursos (Tabelas DynamoDB)

- **certificates**: Certificações e cursos
- **formations**: Formações acadêmicas
- **projects**: Projetos profissionais
- **knowledge**: Stack tecnológico e habilidades

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Build das Lambdas
npm run build

# Deploy da infraestrutura
cd terraform
terraform init
terraform plan
terraform apply

# Testar endpoints
# Use o arquivo api.http na raiz
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── handlers/          # 4 Lambda consolidados (1 por recurso)
│   │   ├── certificates.ts
│   │   ├── formations.ts
│   │   ├── projects.ts
│   │   └── knowledge.ts
│   ├── lib/               # Utilitários (DynamoDB client, schemas)
│   └── __tests__/         # Test suites (71 testes)
├── terraform/             # Infraestrutura IaC
├── api.http              # Testes de API (REST Client)
└── scripts/              # Build scripts
```

## 🔀 Roteamento

Cada Lambda function gerencia múltiplas rotas através de roteamento interno baseado em HTTP method:

**Exemplo: `certificates-handler`**
- `GET /certificates` → getAll()
- `GET /certificates/{id}` → getById()
- `POST /certificates` → create()
- `PUT /certificates/{id}` → update()

Todos os recursos seguem o mesmo pattern.

## 🔑 Endpoints

Cada recurso possui 4 endpoints:

- `GET /{resource}` - Listar todos
- `GET /{resource}/{id}` - Obter por ID
- `POST /{resource}` - Criar novo
- `PUT /{resource}/{id}` - Atualizar existente

## 💰 Otimizações de Custo

- **Consolidated Handlers**: 4 Lambdas vs 16 (75% redução)
- Lambda ARM64 (20% mais barato)
- HTTP API vs REST API (71% economia)
- DynamoDB On-Demand (sem custos idle)
- CloudWatch Logs: 7 dias retenção
- Lambda: 256MB RAM, 10s timeout

**Custo estimado**: ~$1.85/mês para 100K requisições
