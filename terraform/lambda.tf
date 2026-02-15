# Consolidated Lambda Handlers
locals {
  handlers = {
    "certificates" = {
      source_file = "${path.module}/../dist/handlers/certificates.js"
      table_env   = "CERTIFICATES_TABLE"
      table_name  = var.certificates_table_name
    }
    "formations" = {
      source_file = "${path.module}/../dist/handlers/formations.js"
      table_env   = "FORMATIONS_TABLE"
      table_name  = var.formations_table_name
    }
    "projects" = {
      source_file = "${path.module}/../dist/handlers/projects.js"
      table_env   = "PROJECTS_TABLE"
      table_name  = var.projects_table_name
    }
    "knowledge" = {
      source_file = "${path.module}/../dist/handlers/knowledge.js"
      table_env   = "KNOWLEDGE_TABLE"
      table_name  = var.knowledge_table_name
    }
  }
}

# Archive Lambda handlers
data "archive_file" "lambda_zip" {
  for_each = local.handlers

  type        = "zip"
  source_dir  = "${path.module}/.terraform/lambdas-src/${each.key}"
  output_path = "${path.module}/.terraform/lambdas/${each.key}.zip"
}

# Lambda Functions
resource "aws_lambda_function" "handlers" {
  for_each = local.handlers

  filename         = data.archive_file.lambda_zip[each.key].output_path
  function_name    = "${var.project_name}-${each.key}-handler"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.lambda_zip[each.key].output_base64sha256
  runtime         = "nodejs20.x"
  architectures   = ["arm64"]
  memory_size     = var.lambda_memory_size
  timeout         = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV                = var.environment
      CERTIFICATES_TABLE      = var.certificates_table_name
      FORMATIONS_TABLE        = var.formations_table_name
      PROJECTS_TABLE          = var.projects_table_name
      KNOWLEDGE_TABLE         = var.knowledge_table_name
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = aws_lambda_function.handlers

  name              = "/aws/lambda/${each.value.function_name}"
  retention_in_days = var.log_retention_days
}
