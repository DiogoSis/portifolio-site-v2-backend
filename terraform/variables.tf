variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "portfolio-api"
}

variable "certificates_table_name" {
  description = "Name of the certifications DynamoDB table"
  type        = string
  default     = "certifications"
}

variable "formations_table_name" {
  description = "Name of the formations DynamoDB table"
  type        = string
  default     = "formations"
}

variable "projects_table_name" {
  description = "Name of the projects DynamoDB table"
  type        = string
  default     = "projects"
}

variable "knowledge_table_name" {
  description = "Name of the knowledge DynamoDB table"
  type        = string
  default     = "knowledge"
}

variable "lambda_memory_size" {
  description = "Memory size for Lambda functions in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Timeout for Lambda functions in seconds"
  type        = number
  default     = 10
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention period in days"
  type        = number
  default     = 7
}
