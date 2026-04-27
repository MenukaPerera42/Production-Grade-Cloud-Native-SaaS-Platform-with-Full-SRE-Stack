resource "aws_ecr_repository" "main" {
  for_each             = toset(var.repository_names)
  name                 = each.key
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = var.project_name
  }
}

variable "project_name" {
  type = string
}

variable "repository_names" {
  type = list(string)
}

output "repository_urls" {
  value = { for k, v in aws_ecr_repository.main : k => v.repository_url }
}
