terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
  
  # Backend configuration for remote state (uncomment after creating S3 bucket)
  # backend "s3" {
  #   bucket         = "portfolio-terraform-state"
  #   key            = "api/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Portfolio API"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
