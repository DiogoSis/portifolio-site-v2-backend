# Get existing DynamoDB tables
data "aws_dynamodb_table" "certificates" {
  name = var.certificates_table_name
}

data "aws_dynamodb_table" "formations" {
  name = var.formations_table_name
}

data "aws_dynamodb_table" "projects" {
  name = var.projects_table_name
}

data "aws_dynamodb_table" "knowledge" {
  name = var.knowledge_table_name
}

# Get current AWS account ID
data "aws_caller_identity" "current" {}

# Get current AWS region
data "aws_region" "current" {}
