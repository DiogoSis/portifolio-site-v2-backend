# 🚀 Portfolio API - Serverless CRUD com AWS

## ✅ Status da Implementação

Todos os componentes foram criados com sucesso:

### Estrutura do Projeto

```
portifolio-v2-backend/
├── src/
│   ├── handlers/          # 16 Lambda handlers (4 por recurso)
│   │   ├── certificates/  # GET All, GET ID, POST, PUT
│   │   ├── formations/    # GET All, GET ID, POST, PUT
│   │   ├── projects/      # GET All, GET ID, POST, PUT
│   │   └── knowledge/     # GET All, GET ID, POST, PUT
│   └── lib/
│       ├── dynamodb.ts    # Cliente DynamoDB singleton
│       ├── schemas.ts     # Validações Zod
│       └── response.ts    # Helpers de resposta HTTP
├── dist/                  # ✅ Handlers compilados (16 arquivos)
├── terraform/
│   ├── main.tf           # Provider AWS
│   ├── variables.tf      # Variáveis configuráveis
│   ├── data.tf           # Data sources DynamoDB
│   ├── iam.tf            # Roles e Policies
│   ├── lambda.tf         # 16 Lambda Functions
│   ├── api-gateway.tf    # HTTP API + 16 rotas
│   └── outputs.tf        # URL da API
├── api.http              # 20+ requisições de teste
├── package.json          # ✅ Dependências instaladas
└── README.md
```

## 📊 Recursos Implementados

### 4 Tabelas DynamoDB (existentes)
- ✅ **certificates** - Certificações e cursos
- ✅ **formations** - Formações acadêmicas
- ✅ **projects** - Projetos profissionais
- ✅ **knowledge** - Stack tecnológico (rating 1-5)

### 16 Endpoints REST API
Cada recurso possui:
- `GET /{resource}` - Listar todos
- `GET /{resource}/{id}` - Obter por ID
- `POST /{resource}` - Criar novo
- `PUT /{resource}/{id}` - Atualizar existente

### Validações Implementadas
- ✅ Schemas Zod para todos os recursos
- ✅ Validação de IDs numéricos
- ✅ Validação de URLs (certificateUrl, imageUrl, icon)
- ✅ Validação de rating (1-5) para knowledge
- ✅ Validação de arrays (materias, imagesUrl, technologiesUsed)
- ✅ Responses de erro padronizadas (400, 404, 500)

## 🎯 Próximos Passos

### 1️⃣ Deploy da Infraestrutura

```bash
# Entrar na pasta terraform
cd terraform

# Inicializar Terraform
terraform init

# Revisar recursos que serão criados
terraform plan

# Aplicar infraestrutura (confirmar com 'yes')
terraform apply
```

**Recursos que serão criados:**
- 1 IAM Role (Lambda Execution)
- 2 IAM Policies (DynamoDB + CloudWatch)
- 16 Lambda Functions (ARM64, 256MB, Node.js 20.x)
- 1 API Gateway HTTP API
- 16 Rotas REST
- 17 CloudWatch Log Groups
- 16 Lambda Permissions

### 2️⃣ Obter URL da API

Após `terraform apply`, copie o output:

```
Outputs:

api_endpoint = "https://abc123xyz.execute-api.us-east-1.amazonaws.com"
```

### 3️⃣ Atualizar api.http

Edite o arquivo `api.http` na raiz e substitua:

```http
@baseUrl = https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

### 4️⃣ Testar Endpoints

Use a extensão **REST Client** do VS Code:
1. Abra `api.http`
2. Clique em "Send Request" acima de cada requisição
3. Veja a resposta inline no editor

**Testes disponíveis:**
- ✅ GET All (4 recursos)
- ✅ GET By ID (4 recursos)
- ✅ POST Create (4 recursos)
- ✅ PUT Update (4 recursos)
- ✅ Testes de erro (404, 400)

## 💰 Otimizações de Custo Aplicadas

| Recurso | Otimização | Economia |
|---------|-----------|----------|
| Lambda | ARM64 (Graviton2) | -20% |
| API Gateway | HTTP API vs REST | -71% |
| Lambda | 256MB RAM | Ideal Node.js |
| Lambda | 10s timeout | Suficiente DynamoDB |
| CloudWatch | 7 dias retenção | Reduz storage |
| DynamoDB | On-Demand billing | Sem custos idle |

**Estimativa para 100K requests/mês: ~$2/mês**

## 🔧 Comandos Úteis

```bash
# Reinstalar dependências
npm install

# Recompilar Lambdas
npm run build

# Ver logs de Lambda específica
aws logs tail /aws/lambda/portfolio-api-certificates-getAll --follow

# Ver status do Terraform
cd terraform && terraform show

# Destruir infraestrutura (mantém DynamoDB)
cd terraform && terraform destroy
```

## 📝 Schemas de Dados

### Certificate
```json
{
  "id": 1,
  "categoryCode": "Cloud",
  "certificateUrl": "https://...",
  "courseName": "AWS Certified",
  "finishedAt": "12/16/2022",
  "imageUrl": "https://...",
  "startedAt": "12/10/2022"
}
```

### Formation
```json
{
  "id": 3,
  "name": "Full Stack Developer",
  "area": "Desenvolvimento Web",
  "certificate": "https://...",
  "conclusion": "10/12/2022",
  "materias": ["Node.js", "React", "AWS"]
}
```

### Project
```json
{
  "id": 1,
  "projectName": "E-commerce Platform",
  "description": "...",
  "categoryLocal": "Freelance",
  "typePerformance": "Full Stack",
  "imagesUrl": ["https://..."],
  "technologiesUsed": ["TypeScript", "React"]
}
```

### Knowledge
```json
{
  "id": 7,
  "name": "NPM",
  "icon": "https://cdn.jsdelivr.net/...",
  "type": "gerenciador de pacotes",
  "rating": 4
}
```

## 🔐 Segurança

- ✅ IAM Role com Least Privilege
- ✅ Permissões restritas às 4 tabelas DynamoDB
- ✅ CloudWatch Logs habilitados
- ✅ CORS configurado no API Gateway
- ✅ Logs de acesso estruturados (JSON)

## 📚 Próximas Fases (Conforme Planejamento)

- [ ] **Fase 2**: Integração RAG com Upstash Vector + Groq API
- [ ] **Fase 3**: Endpoint `/chat` para assistente IA
- [ ] **Fase 4**: Autenticação (Cognito/API Keys)
- [ ] **Fase 5**: Rate limiting e throttling
- [ ] **Fase 6**: CI/CD com GitHub Actions

## ⚠️ Notas Importantes

1. **Tabelas DynamoDB**: Devem existir antes do deploy
2. **Build obrigatório**: Execute `npm run build` antes de `terraform apply`
3. **AWS Credentials**: Configure AWS CLI com permissões adequadas
4. **Backend S3**: Comente o bloco `backend "s3"` em `main.tf` no primeiro deploy

---

**Desenvolvido por Diogo Luna**  
**Arquitetura**: Serverless Event-Driven com AWS Lambda + DynamoDB  
**IaC**: Terraform  
**Runtime**: Node.js 20.x (ARM64)
