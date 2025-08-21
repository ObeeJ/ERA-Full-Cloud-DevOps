variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "raally"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones for the VPC"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "eks_cluster_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.27"
}

variable "eks_node_groups" {
  description = "EKS node group configurations"
  type = map(object({
    instance_types = list(string)
    min_size      = number
    max_size      = number
    desired_size  = number
    capacity_type = string
    disk_size     = number
  }))
  default = {
    general = {
      instance_types = ["t3.medium"]
      min_size      = 2
      max_size      = 6
      desired_size  = 3
      capacity_type = "ON_DEMAND"
      disk_size     = 50
    }
    compute = {
      instance_types = ["c5.large"]
      min_size      = 1
      max_size      = 10
      desired_size  = 2
      capacity_type = "SPOT"
      disk_size     = 50
    }
  }
}

# RDS Variables
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "RDS max allocated storage in GB"
  type        = number
  default     = 100
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "raally"
}

variable "database_username" {
  description = "Database username"
  type        = string
  default     = "raally"
}

variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Redis Variables
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes in the Redis cluster"
  type        = number
  default     = 2
}

variable "redis_auth_token" {
  description = "Auth token for Redis cluster"
  type        = string
  sensitive   = true
}

# Kafka Variables
variable "kafka_version" {
  description = "Apache Kafka version"
  type        = string
  default     = "2.8.1"
}

variable "kafka_broker_nodes" {
  description = "Number of broker nodes in the Kafka cluster"
  type        = number
  default     = 3
}

variable "kafka_instance_type" {
  description = "Instance type for Kafka brokers"
  type        = string
  default     = "kafka.t3.small"
}

variable "kafka_volume_size" {
  description = "EBS volume size for Kafka brokers in GB"
  type        = number
  default     = 100
}

# Application Variables
variable "app_domain" {
  description = "Domain name for the application"
  type        = string
  default     = "app.raally.com"
}

variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate for HTTPS"
  type        = string
  default     = ""
}
