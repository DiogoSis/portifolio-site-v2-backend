output "api_endpoint" {
  description = "Base URL for API Gateway"
  value       = aws_apigatewayv2_api.main.api_endpoint
}

output "api_id" {
  description = "ID of the API Gateway"
  value       = aws_apigatewayv2_api.main.id
}

output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution.arn
}

output "dynamodb_tables" {
  description = "ARNs of the DynamoDB tables"
  value = {
    certificates = data.aws_dynamodb_table.certificates.arn
    formations   = data.aws_dynamodb_table.formations.arn
    projects     = data.aws_dynamodb_table.projects.arn
    knowledge    = data.aws_dynamodb_table.knowledge.arn
  }
}

output "lambda_functions" {
  description = "Names of deployed Lambda functions"
  value       = [for fn in aws_lambda_function.handlers : fn.function_name]
}
