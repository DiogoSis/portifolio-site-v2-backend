# Portfolio v2 Backend - Serverless API

API REST serverless desenvolvida com AWS Lambda + API Gateway HTTP + DynamoDB para gerenciamento de conteúdo do portfolio.

## 🏗️ Arquitetura

- **Runtime**: Node.js 20.x (ARM64/Graviton2)
- **API Gateway**: HTTP API (otimizado para custo)
- **Database**: DynamoDB (On-Demand billing)
- **IaC**: Terraform
- **Framework**: AWS SDK v3 + Zod

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
│   ├── handlers/          # Lambda handlers (CRUD para cada recurso)
│   ├── lib/               # Utilitários (DynamoDB client, schemas)
│   └── types/             # TypeScript types
├── terraform/             # Infraestrutura IaC
├── api.http              # Testes de API (REST Client)
└── scripts/              # Build scripts
```

## 🔑 Endpoints

Cada recurso possui 4 endpoints:

- `GET /{resource}` - Listar todos
- `GET /{resource}/{id}` - Obter por ID
- `POST /{resource}` - Criar novo
- `PUT /{resource}/{id}` - Atualizar existente

## 💰 Otimizações de Custo

- Lambda ARM64 (20% mais barato)
- HTTP API vs REST API (71% economia)
- DynamoDB On-Demand (sem custos idle)
- CloudWatch Logs: 7 dias retenção
- Lambda: 256MB RAM, 10s timeout
