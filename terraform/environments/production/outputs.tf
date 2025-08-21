output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "eks_node_security_group_id" {
  description = "Security group ID attached to the EKS node group"
  value       = module.eks.node_security_group_id
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.raally.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.raally.port
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.raally.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.raally.port
}

output "kafka_bootstrap_brokers" {
  description = "MSK Kafka bootstrap brokers"
  value       = aws_msk_cluster.raally.bootstrap_brokers
  sensitive   = true
}

output "kafka_bootstrap_brokers_tls" {
  description = "MSK Kafka bootstrap brokers with TLS"
  value       = aws_msk_cluster.raally.bootstrap_brokers_tls
  sensitive   = true
}

output "kubectl_config_command" {
  description = "kubectl config command to connect to EKS cluster"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}"
}

output "application_urls" {
  description = "Application URLs"
  value = {
    frontend = "https://${var.app_domain}"
    api      = "https://${var.app_domain}/api"
    health   = "https://${var.app_domain}/api/health"
  }
}

output "infrastructure_info" {
  description = "Infrastructure information for deployment"
  value = {
    cluster_name     = module.eks.cluster_name
    namespace        = "raally"
    database_host    = aws_db_instance.raally.endpoint
    database_port    = aws_db_instance.raally.port
    database_name    = aws_db_instance.raally.db_name
    redis_host       = aws_elasticache_replication_group.raally.primary_endpoint_address
    redis_port       = aws_elasticache_replication_group.raally.port
    kafka_brokers    = aws_msk_cluster.raally.bootstrap_brokers_tls
  }
  sensitive = true
}
