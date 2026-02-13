# Infrastructure Architecture (Terraform) | Portfolio Diogo Luna (v2.0)

> **Repository:** `portfolio-api/terraform`
> **Role:** Infrastructure Governance & Security.
> **Focus:** IAM Policy Management, Legacy Resource Integration, and Remote State.

---

## 1. High-Level Strategy

A infraestrutura segue uma abordagem híbrida **"Brownfield"** (integração com recursos existentes).
O Terraform não será responsável por criar os bancos de dados (que já existem), mas atuará como o **Governador de Segurança**, gerenciando exclusivamente as permissões (IAM) que a aplicação Serverless poderá utilizar.

* **Scope:** Gerenciamento de Identidade e Acesso (IAM) e Estado da Infraestrutura.
* **Excluded Scope:** Provisionamento de Computação (Lambda) e Banco de Dados (DynamoDB).

---

## 2. Resource Integration Specification

Como as tabelas DynamoDB (`certificates`, `formations`, `projects`) foram provisionadas manualmente ou por outro processo, o Terraform deve adotar a estratégia de **Data Sourcing**.

### 2.1. External Data References
O Terraform deve ser configurado para ler os metadados dos recursos existentes na conta AWS, especificamente:
* Recuperar o **ARN (Amazon Resource Name)** da tabela `certificates`.
* Recuperar o **ARN** da tabela `formations`.
* Recuperar o **ARN** da tabela `projects`.

**Objetivo:** Permitir que as políticas de segurança referenciem dinamicamente esses recursos sem tentar recriá-los ou modificá-los.

---

## 3. Security & IAM Architecture

O foco principal do Terraform neste projeto é implementar o princípio de **Privilégio Mínimo (Least Privilege)** para a aplicação Serverless.

### 3.1. Lambda Execution Role
Deve ser provisionada uma **IAM Role** dedicada para a execução da API Serverless.
* **Trust Relationship:** A Role deve confiar exclusivamente no serviço `lambda.amazonaws.com`.

### 3.2. Access Policies
Devem ser criadas políticas granulares anexadas à Role de Execução:

1.  **Policy: DynamoDB Read-Only**
    * **Action:** Permitir apenas operações de leitura (`GetItem`, `Scan`, `Query`).
    * **Resource:** Restrito estritamente aos ARNs das três tabelas recuperadas (Certificates, Formations, Projects).
    * **Constraint:** Bloquear qualquer tentativa de `PutItem`, `DeleteItem` ou `UpdateItem` via API pública.

2.  **Policy: CloudWatch Logging**
    * **Action:** Permitir criação de Log Groups e Log Streams.
    * **Resource:** Restrito à região de deploy.

---

## 4. State Management Strategy

Para garantir a colaboração e segurança do estado da infraestrutura (o arquivo `.tfstate`), não deve ser utilizado armazenamento local.

* **Backend Storage:** Utilizar um Bucket S3 privado para armazenar o arquivo de estado.
* **Locking (Opcional):** Utilizar uma tabela DynamoDB separada para bloqueio de estado (State Locking) para prevenir condições de corrida em deploys simultâneos (CI/CD).
* **Encryption:** O arquivo de estado deve ser encriptado em repouso (SSE-S3 ou KMS).

---

## 5. Deployment Workflow Integration

O fluxo de provisionamento deve respeitar a dependência entre Infraestrutura Base e Aplicação.

1.  **Phase 1: Security Layer (Terraform)**
    * Execução do Terraform para criar a IAM Role e as Policies.
    * Output: O Terraform deve exportar o `Role ARN` ou o nome da Role provisionada.

2.  **Phase 2: Application Layer (SST)**
    * O framework Serverless (SST) deve ser configurado para utilizar a Role criada na Fase 1.
    * Isso garante que a Lambda suba já com as permissões corretas de acesso às tabelas DynamoDB existentes, sem que o desenvolvedor precise hardcodar credenciais.

---

## 6. Disaster Recovery & Compliance

* **Infrastructure as Code:** Toda a definição de permissões deve estar versionada no Git.
* **Auditability:** Alterações nas permissões das tabelas devem ser feitas via Pull Request no repositório do Terraform, garantindo rastro de auditoria sobre quem liberou acesso a quê.