# Raally (Resource allocation ally)
Welcome to the Raally project. Raally is an application that helps and simplifies managing people's allocation on projects. Its purpose is to store information about people such as job title and compensation as well as information about projects and project assignments. With this information Raally can display a dashboard that shows utilization of company's workforce.
Raally is a multitenant SaaS application where users can belong to one or many workspaces/tenants either as Company Admin or as a Resource Manager.
## 🚀 DevOps & Infrastructure Enhancement
This project has been enhanced with enterprise-grade DevOps practices including:
- **🐳 Docker & Containerization:** Multi-stage builds with security best practices
- **☸️ Kubernetes Orchestration:** Production-ready deployment with auto-scaling
- **📨 Event-Driven Architecture:** Kafka integration for real-time messaging
- **⚡ Performance Optimization:** Redis caching and session management
- **🏗️ Infrastructure as Code:** Terraform modules for AWS deployment
- **📊 Monitoring & Observability:** Health checks, logging, and metrics
📖 **Documentation:**
- [DevOps Architecture Guide](./DEVOPS_README.md) - Comprehensive infrastructure overview
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Step-by-step deployment instructions
- [Portfolio Documentation](./PORTFOLIO_README.md) - Challenge completion summary
## Quick Start Options
### Option 1: Docker Compose (Recommended for Development)
```bash
# Start all services (Kafka, Redis, Backend, Frontend)
docker-compose up -d
# View logs
docker-compose logs -f
# Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:3001/api
# Health Check: http://localhost:3001/api/health
```
### Option 2: Traditional Development Setupy (Resource allocation ally)
Welcome to the Raally project. Raally is an application that helps and simplifies managing people’s allocation on projects. Its purpose is to store information about people such as job title and compensation as well as information about projects and project assignments. With this information Raally can display a dashboard that shows utilization of company’s workforce.
Raally is a multitenant SaaS application where users can belong to one or many workspaces/tenants either as Company Admin or as a Resource Manager.
## Getting Started
### Option 2: Traditional Development Setup
#### Prerequisites
- Node.js v20.16.0
- npm or yarn
### Backend
The Backend app uses NodeJs v20.16.0 and SQLite, you can add/remove any data that you want, but please don´t change the structure of the database.
#### Install Backend Dependencies
In order to install the backend project dependencies run inside the backend folder:
```bash
cd raally-backend-js-node
npm install --force
```
#### Running Backend Application
The following command inside the backend folder will run the backend server:
```bash
npm start
```
After this you would be able to access backend at <http://localhost:8080>.
### Frontend
The Frontend app also uses NodeJs v20.16.0.
#### Install Frontend Dependencies
In order to install the frontend project dependencies run inside the frontend folder:
```bash
cd raally-frontend-js-react
npm install --force
```
#### Running Frontend Application
The following command will run the SPA in local dev server:
```bash
npm start
```
The application will be available at <http://localhost:3000> and by default you should see a welcome message there.
## Production Deployment
### Docker Images
Build optimized Docker images:
```bash
# Build all images
./build-images.sh v1.0.0
# Build and push to registry
./build-images.sh v1.0.0 your-registry.com true
```
### Kubernetes Deployment
Deploy to Kubernetes cluster:
```bash
# Configure kubectl for your cluster
kubectl config use-context your-cluster
# Deploy application
kubectl apply -k k8s/overlays/production
# Check deployment
kubectl get pods -n raally
kubectl get svc -n raally
```
### AWS Infrastructure
Deploy with Terraform:
```bash
cd terraform/environments/production
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```
## Architecture
```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React + TS    │────│   Node.js       │────│   PostgreSQL    │
│   (Port 80)     │    │   (Port 3001)   │    │   / SQLite      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │     Redis       │    │     Kafka       │
         └──────────────│   (Caching)     │    │  (Messaging)    │
                        │   (Port 6379)   │    │  (Port 9092)    │
                        └─────────────────┘    └─────────────────┘
```
## Key Features
### Business Functionality
- **Multi-tenant SaaS:** Workspace isolation and management
- **Role-based Access:** Company Admin and Resource Manager roles
- **Resource Allocation:** Project assignments and utilization tracking
- **Dashboard Analytics:** Workforce utilization insights
- **Internationalization:** English, Spanish, Portuguese support
### DevOps Features
- **Container Orchestration:** Kubernetes with auto-scaling
- **Event-Driven Architecture:** Real-time messaging with Kafka
- **Performance Optimization:** Redis caching layer
- **Infrastructure as Code:** Terraform AWS modules
- **Monitoring:** Health checks and observability
- **Security:** TLS encryption, RBAC, secrets management
It is important to make sure that code can be built for production succesfully before submitting the solution.
### Default User Setup
The initial database already contains some sample data and you can access it with the following users:
- **username:** `user1@test.com`
- **password:** Test@123
---
- **username:** `user2@test.com`
- **password:** Test@123
---
- **username:** `user3@test.com`
- **password:** Test@123
Each user has access to different workspaces with the following roles:
- `user1@test.com`
  - Workspace 01 with admin role
  - Workspace 02 with admin role
  - Workspace 03 with admin role
- `user2@test.com`
  - Workspace 01 with admin role
  - Workspace 02 with resource manager role
- `user3@test.com`
  - Workspace 04 with admin role""

