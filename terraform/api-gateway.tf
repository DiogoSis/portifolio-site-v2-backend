# HTTP API Gateway
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"
  description   = "Portfolio API - HTTP API Gateway"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# API Stage
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = var.log_retention_days
}

# Lambda Integrations (4 consolidated handlers)
resource "aws_apigatewayv2_integration" "lambda" {
  for_each = aws_lambda_function.handlers

  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = each.value.invoke_arn
  payload_format_version = "2.0"
}

# Routes - Certificates (all routes use the same certificates handler)
resource "aws_apigatewayv2_route" "certificates" {
  for_each = toset([
    "GET /certificates",
    "GET /certificates/{id}",
    "POST /certificates",
    "PUT /certificates/{id}"
  ])

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.lambda["certificates"].id}"
}

# Routes - Formations (all routes use the same formations handler)
resource "aws_apigatewayv2_route" "formations" {
  for_each = toset([
    "GET /formations",
    "GET /formations/{id}",
    "POST /formations",
    "PUT /formations/{id}"
  ])

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.lambda["formations"].id}"
}

# Routes - Projects (all routes use the same projects handler)
resource "aws_apigatewayv2_route" "projects" {
  for_each = toset([
    "GET /projects",
    "GET /projects/{id}",
    "POST /projects",
    "PUT /projects/{id}"
  ])

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.lambda["projects"].id}"
}

# Routes - Knowledge (all routes use the same knowledge handler)
resource "aws_apigatewayv2_route" "knowledge" {
  for_each = toset([
    "GET /knowledge",
    "GET /knowledge/{id}",
    "POST /knowledge",
    "PUT /knowledge/{id}"
  ])

  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.lambda["knowledge"].id}"
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "api_gateway" {
  for_each = aws_lambda_function.handlers

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = each.value.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
