# DevOps Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Raally SaaS application using modern DevOps practices with Docker, Kubernetes, and AWS infrastructure.

## Prerequisites

### Required Tools

```bash
# Docker & Docker Compose
docker --version
docker-compose --version

# Kubernetes CLI
kubectl version --client

# AWS CLI
aws --version

# Terraform
terraform --version

# Node.js (for local development)
node --version
npm --version
```

### AWS Setup

1. **Configure AWS CLI:**

```bash
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-west-2), Output format (json)
```

2.**Verify AWS Access:**

```bash
aws sts get-caller-identity
```

## Local Development Setup

### 1. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Start Services with Docker Compose

```bash
# Start all services in background
docker-compose up -d

# View service status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

### 3. Verify Local Deployment

```bash
# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:80/health

# Check Kafka UI
open http://localhost:8080

# Check Redis Insight
open http://localhost:8001
```

## Production Infrastructure Deployment

### 1. Terraform Setup

```bash
cd terraform/environments/production

# Create terraform.tfvars
cat > terraform.tfvars << EOF
aws_region = "us-west-2"
environment = "production"
project_name = "raally"

# Database
database_password = "your-secure-database-password"
redis_auth_token = "your-secure-redis-token"

# Domain
app_domain = "app.raally.com"
ssl_certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/your-cert-id"
EOF
```

### 2. Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Review planned changes
terraform plan -var-file="terraform.tfvars"

# Apply infrastructure
terraform apply -var-file="terraform.tfvars"

# Save outputs
terraform output > ../../../infrastructure-outputs.txt
```

### 3. Configure kubectl

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-west-2 --name raally-production-cluster

# Verify connection
kubectl get nodes
kubectl get namespaces
```

## Container Registry Setup

### 1. Create ECR Repositories

```bash
# Backend repository
aws ecr create-repository --repository-name raally/backend --region us-west-2

# Frontend repository
aws ecr create-repository --repository-name raally/frontend --region us-west-2

# Get login token
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
```

### 2. Build and Push Images

```bash
# Build backend image
cd raally-backend-js-node
docker build -t raally/backend:v1.0.0 .
docker tag raally/backend:v1.0.0 123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/backend:v1.0.0
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/backend:v1.0.0

# Build frontend image
cd ../raally-frontend-js-react
docker build -t raally/frontend:v1.0.0 .
docker tag raally/frontend:v1.0.0 123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/frontend:v1.0.0
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/frontend:v1.0.0
```

## Kubernetes Deployment

### 1. Update Image References

```bash
cd k8s/base

# Update backend deployment
sed -i 's|raally/backend:latest|123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/backend:v1.0.0|g' backend-deployment.yaml

# Update frontend deployment
sed -i 's|raally/frontend:latest|123456789012.dkr.ecr.us-west-2.amazonaws.com/raally/frontend:v1.0.0|g' frontend-deployment.yaml
```

### 2. Update Configuration

```bash
# Update configmap with production values
kubectl create configmap raally-config \
  --from-literal=NODE_ENV=production \
  --from-literal=PORT=3001 \
  --from-literal=DEFAULT_LANGUAGE=en \
  --from-literal=REDIS_HOST=$(terraform output -raw redis_endpoint) \
  --from-literal=REDIS_PORT=6379 \
  --from-literal=KAFKA_BROKERS=$(terraform output -raw kafka_bootstrap_brokers_tls) \
  --from-literal=KAFKA_CLIENT_ID=raally-app \
  --namespace=raally \
  --dry-run=client -o yaml > configmap-production.yaml

# Create secrets
kubectl create secret generic raally-secrets \
  --from-literal=JWT_SECRET=your-production-jwt-secret \
  --from-literal=REDIS_PASSWORD=your-redis-password \
  --from-literal=DATABASE_URL=postgresql://raally:password@$(terraform output -raw rds_endpoint):5432/raally \
  --namespace=raally \
  --dry-run=client -o yaml > secrets-production.yaml
```

### 3. Deploy Application

```bash
# Apply namespace
kubectl apply -f k8s/base/namespace.yaml

# Apply configurations
kubectl apply -f configmap-production.yaml
kubectl apply -f secrets-production.yaml

# Deploy infrastructure components
kubectl apply -f k8s/base/persistent-volumes.yaml
kubectl apply -f k8s/base/redis-deployment.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=ready pod -l app=raally-redis -n raally --timeout=300s

# Deploy Kafka (if using in-cluster)
kubectl apply -f k8s/base/kafka-deployment.yaml

# Wait for Kafka to be ready
kubectl wait --for=condition=ready pod -l app=raally-kafka -n raally --timeout=600s

# Deploy application
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml

# Deploy load balancer
kubectl apply -f k8s/base/ingress.yaml

# Deploy autoscaling
kubectl apply -f k8s/base/hpa.yaml
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n raally

# Check services
kubectl get svc -n raally

# Check ingress
kubectl get ingress -n raally

# Check logs
kubectl logs -f deployment/raally-backend -n raally
kubectl logs -f deployment/raally-frontend -n raally

# Check health
kubectl exec -it deployment/raally-backend -n raally -- curl http://localhost:3001/api/health
```

## Monitoring Setup

### 1. Install Prometheus & Grafana

```bash
# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Install Grafana
helm install grafana grafana/grafana \
  --namespace monitoring \
  --set persistence.enabled=true \
  --set persistence.size=10Gi
```

### 2. Configure Service Monitors

```bash
# Create service monitor for backend
cat > backend-servicemonitor.yaml << EOF
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: raally-backend
  namespace: raally
spec:
  selector:
    matchLabels:
      app: raally-backend
  endpoints:
  - port: http
    path: /api/metrics
EOF

kubectl apply -f backend-servicemonitor.yaml
```

## Backup & Recovery

### 1. Database Backup

```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
DB_HOST=$(terraform output -raw rds_endpoint)
DB_NAME="raally"
DB_USER="raally"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/raally_backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/raally_backup_$DATE.sql s3://raally-backups/database/

# Clean local backup
rm $BACKUP_DIR/raally_backup_$DATE.sql
EOF

chmod +x backup-db.sh
```

### 2. Application State Backup

```bash
# Backup Redis data
kubectl exec raally-redis-0 -n raally -- redis-cli BGSAVE

# Backup Kafka topics
kubectl exec raally-kafka-0 -n raally -- kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic raally.audit.action_performed \
  --from-beginning \
  --timeout-ms 5000 > audit_backup.json
```

## Troubleshooting

### Common Issues

1. **Pod Startup Failures:**

```bash
kubectl describe pod <pod-name> -n raally
kubectl logs <pod-name> -n raally --previous
```

2.**Service Discovery Issues:**

```bash
kubectl get endpoints -n raally
kubectl run debug --image=busybox -it --rm -- nslookup raally-backend-service.raally.svc.cluster.local
```

3.**Database Connection Issues:**

```bash
kubectl exec -it deployment/raally-backend -n raally -- env | grep DATABASE
kubectl run postgres-test --image=postgres:15 -it --rm -- psql $DATABASE_URL
```

4.**Redis Connection Issues:**

```bash
kubectl exec -it deployment/raally-backend -n raally -- env | grep REDIS
kubectl exec -it raally-redis-0 -n raally -- redis-cli ping
```

5.**Kafka Connection Issues:**

```bash
kubectl exec -it raally-kafka-0 -n raally -- kafka-topics.sh --list --bootstrap-server localhost:9092
```

### Performance Optimization

1. **Resource Monitoring:**

```bash
kubectl top nodes
kubectl top pods -n raally
```

2.**Scaling Verification:**

```bash
kubectl get hpa -n raally
kubectl describe hpa raally-backend-hpa -n raally
```

3.**Network Performance:**

```bash
kubectl run netshoot --image=nicolaka/netshoot -it --rm -- iperf3 -c raally-backend-service.raally.svc.cluster.local
```

## Security Checklist

- [ ] All secrets are stored in Kubernetes secrets, not in code
- [ ] Database and Redis use encrypted connections
- [ ] Network policies are applied for traffic segmentation
- [ ] Pod security policies are enforced
- [ ] RBAC is configured with least privilege
- [ ] Container images are scanned for vulnerabilities
- [ ] SSL certificates are properly configured
- [ ] Backup encryption is enabled

## Maintenance Tasks

### Regular Updates

```bash
# Update container images
./scripts/update-images.sh

# Update Kubernetes manifests
kubectl apply -k k8s/overlays/production

# Update infrastructure
cd terraform/environments/production
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### Health Monitoring

```bash
# Daily health check
kubectl get pods -n raally
curl https://app.raally.com/api/health

# Weekly performance review
kubectl top pods -n raally --sort-by=cpu
kubectl top pods -n raally --sort-by=memory
```

This deployment guide ensures a robust, scalable, and maintainable production environment following DevOps best practices.
