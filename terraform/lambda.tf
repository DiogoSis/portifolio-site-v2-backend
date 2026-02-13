# Archive Lambda handlers
data "archive_file" "lambda_zip" {
  for_each = toset([
    "certificates-getAll",
    "certificates-getById",
    "certificates-create",
    "certificates-update",
    "formations-getAll",
    "formations-getById",
    "formations-create",
    "formations-update",
    "projects-getAll",
    "projects-getById",
    "projects-create",
    "projects-update",
    "knowledge-getAll",
    "knowledge-getById",
    "knowledge-create",
    "knowledge-update"
  ])

  type        = "zip"
  source_dir  = "${path.module}/.terraform/lambdas-src/${each.key}"
  output_path = "${path.module}/.terraform/lambdas/${each.key}.zip"
}

# Lambda Functions
resource "aws_lambda_function" "handlers" {
  for_each = toset([
    "certificates-getAll",
    "certificates-getById",
    "certificates-create",
    "certificates-update",
    "formations-getAll",
    "formations-getById",
    "formations-create",
    "formations-update",
    "projects-getAll",
    "projects-getById",
    "projects-create",
    "projects-update",
    "knowledge-getAll",
    "knowledge-getById",
    "knowledge-create",
    "knowledge-update"
  ])

  filename         = data.archive_file.lambda_zip[each.key].output_path
  function_name    = "${var.project_name}-${each.key}"
  role            = aws_iam_role.lambda_execution.arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.lambda_zip[each.key].output_base64sha256
  runtime         = "nodejs20.x"
  architectures   = ["arm64"]
  memory_size     = var.lambda_memory_size
  timeout         = var.lambda_timeout

  environment {
    variables = {
      NODE_ENV           = var.environment
      CERTIFICATES_TABLE = var.certificates_table_name
      FORMATIONS_TABLE   = var.formations_table_name
      PROJECTS_TABLE     = var.projects_table_name
      KNOWLEDGE_TABLE    = var.knowledge_table_name
    }
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda_logs" {
  for_each = aws_lambda_function.handlers

  name              = "/aws/lambda/${each.value.function_name}"
  retention_in_days = var.log_retention_days
}
