# Terraform Deployment Guide

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform installed (>= 1.0)
3. Node.js 20.x installed
4. Existing DynamoDB tables: `certificates`, `formations`, `projects`, `knowledge`

## Deployment Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Lambda Functions

```bash
npm run build
```

This will compile TypeScript handlers to JavaScript in the `dist/` folder.

### 3. Initialize Terraform

```bash
cd terraform
terraform init
```

### 4. Review Infrastructure Plan

```bash
terraform plan
```

Check the resources that will be created:
- IAM Role and Policies
- 4 Consolidated Lambda Functions (1 per resource with HTTP routing)
- API Gateway HTTP API
- CloudWatch Log Groups
- 16 API Routes pointing to 4 Integrations

### 5. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` to confirm deployment.

### 6. Get API Endpoint

After successful deployment, Terraform will output the API endpoint URL:

```
Outputs:

api_endpoint = "https://abc123xyz.execute-api.us-east-1.amazonaws.com"
```

### 7. Update api.http

Copy the `api_endpoint` value and update the `@baseUrl` variable in the root `api.http` file:

```http
@baseUrl = https://abc123xyz.execute-api.us-east-1.amazonaws.com
```

### 8. Test Endpoints

Use VS Code REST Client extension to test the endpoints in `api.http`.

## Architecture

### Consolidated Lambda Pattern

Each Lambda function handles multiple routes for its resource:

- **certificates-handler**: Routes all GET/POST/PUT requests for `/certificates`
- **formations-handler**: Routes all GET/POST/PUT requests for `/formations`
- **projects-handler**: Routes all GET/POST/PUT requests for `/projects`
- **knowledge-handler**: Routes all GET/POST/PUT requests for `/knowledge`

Routing is performed internally based on `event.requestContext.http.method` and path parameters.

**Benefits:**
- 75% reduction in Lambda functions (16 → 4)
- Simplified deployment and maintenance
- Reduced API Gateway integrations
- Lower cold start frequency per resource

## Cost Optimization Features

✅ **Consolidated Handlers** - 75% fewer Lambda functions  
✅ **Lambda ARM64** - 20% cost reduction using Graviton2  
✅ **HTTP API** - 71% cheaper than REST API  
✅ **DynamoDB On-Demand** - No idle costs  
✅ **256MB RAM** - Optimal memory for Node.js  
✅ **10s Timeout** - Sufficient for DynamoDB operations  
✅ **7 Days Log Retention** - Reduced storage costs  

## Estimated Monthly Costs

Assuming 100,000 requests/month:

- **Lambda**: ~$0.15 (ARM64 pricing, 4 consolidated functions)
- **API Gateway HTTP**: ~$0.10
- **DynamoDB**: ~$1.25 (read/write on-demand)
- **CloudWatch Logs**: ~$0.35 (4 log groups instead of 16)

**Total: ~$1.85/month** for 100K requests

💡 **10% cost reduction** compared to previous 16-Lambda architecture

## Cleanup

To destroy all resources:

```bash
cd terraform
terraform destroy
```

⚠️ **Note**: This will NOT delete DynamoDB tables (they're managed externally).

## Troubleshooting

### Lambda Build Errors

If build fails, check:
```bash
npm run build 2>&1 | grep -i error
```

### Terraform State Issues

If state is corrupted:
```bash
terraform refresh
```

### DynamoDB Access Denied

Verify IAM policies allow Lambda to access tables:
```bash
aws iam get-role-policy --role-name portfolio-api-lambda-execution-role --policy-name portfolio-api-dynamodb-access
```
