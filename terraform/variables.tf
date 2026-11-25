variable "aws_region" {
  type        = string
  description = "AWS region for Lambda, API Gateway, S3 and SES."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "Prefix for AWS resource names."
  default     = "product-catalog"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{0,20}$", var.project_name))
    error_message = "Use 1-21 lowercase letters, digits or hyphens, starting with a letter."
  }
}

variable "mail_from" {
  type        = string
  description = "Verified SES sender email address."
}

variable "sales_inbox" {
  type        = string
  description = "Email address that receives customer enquiries."
}

variable "ses_identity_arn" {
  type        = string
  description = "ARN of the verified SES identity allowed to send email."
}