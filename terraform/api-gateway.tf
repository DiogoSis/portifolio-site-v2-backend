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

# Lambda Integrations
resource "aws_apigatewayv2_integration" "lambda" {
  for_each = aws_lambda_function.handlers

  api_id           = aws_apigatewayv2_api.main.id
  integration_type = "AWS_PROXY"
  integration_uri  = each.value.invoke_arn
  payload_format_version = "2.0"
}

# Routes - Certificates
resource "aws_apigatewayv2_route" "certificates_get_all" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /certificates"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["certificates-getAll"].id}"
}

resource "aws_apigatewayv2_route" "certificates_get_by_id" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /certificates/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["certificates-getById"].id}"
}

resource "aws_apigatewayv2_route" "certificates_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /certificates"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["certificates-create"].id}"
}

resource "aws_apigatewayv2_route" "certificates_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /certificates/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["certificates-update"].id}"
}

# Routes - Formations
resource "aws_apigatewayv2_route" "formations_get_all" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /formations"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["formations-getAll"].id}"
}

resource "aws_apigatewayv2_route" "formations_get_by_id" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /formations/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["formations-getById"].id}"
}

resource "aws_apigatewayv2_route" "formations_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /formations"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["formations-create"].id}"
}

resource "aws_apigatewayv2_route" "formations_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /formations/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["formations-update"].id}"
}

# Routes - Projects
resource "aws_apigatewayv2_route" "projects_get_all" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /projects"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["projects-getAll"].id}"
}

resource "aws_apigatewayv2_route" "projects_get_by_id" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /projects/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["projects-getById"].id}"
}

resource "aws_apigatewayv2_route" "projects_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /projects"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["projects-create"].id}"
}

resource "aws_apigatewayv2_route" "projects_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /projects/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["projects-update"].id}"
}

# Routes - Knowledge
resource "aws_apigatewayv2_route" "knowledge_get_all" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /knowledge"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["knowledge-getAll"].id}"
}

resource "aws_apigatewayv2_route" "knowledge_get_by_id" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /knowledge/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["knowledge-getById"].id}"
}

resource "aws_apigatewayv2_route" "knowledge_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /knowledge"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["knowledge-create"].id}"
}

resource "aws_apigatewayv2_route" "knowledge_update" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PUT /knowledge/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda["knowledge-update"].id}"
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
