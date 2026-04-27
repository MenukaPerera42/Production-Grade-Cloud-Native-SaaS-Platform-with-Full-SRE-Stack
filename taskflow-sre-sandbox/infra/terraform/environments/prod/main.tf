terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
}

module "iam" {
  source       = "../../modules/iam"
  project_name = var.project_name
}

module "ecr" {
  source           = "../../modules/ecr"
  project_name     = var.project_name
  repository_names = ["api-server", "frontend", "worker"]
}

module "eks" {
  source           = "../../modules/eks"
  cluster_name     = "${var.project_name}-cluster"
  cluster_role_arn = module.iam.cluster_role_arn
  node_role_arn    = module.iam.node_role_arn
  subnet_ids       = module.vpc.private_subnet_ids
  desired_size     = 2
  max_size         = 4
  min_size         = 1
  instance_types   = ["t3.medium"]
}
