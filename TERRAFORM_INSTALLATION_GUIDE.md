# Terraform Installation and Setup Guide

## Installing Terraform on Windows

### Option 1: Using Chocolatey (Recommended)
```bash
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Terraform
choco install terraform
```

### Option 2: Manual Installation
1. Download Terraform from: https://www.terraform.io/downloads
2. Extract the ZIP file to a directory (e.g., `C:\terraform`)
3. Add the directory to your PATH environment variable

### Option 3: Using HashiCorp's Official Installer
```powershell
# Download and install using PowerShell
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri "https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_windows_amd64.zip" -OutFile "terraform.zip"
Expand-Archive terraform.zip -DestinationPath "C:\terraform"
$env:PATH += ";C:\terraform"
```

## Terraform Configuration Fixes

### Current Issues in main.tf

The Terraform configuration has module attribute issues that need to be resolved:

#### VPC Module Issues (Lines 80-84)
```hcl
# ❌ Current (incorrect attributes)
module "vpc" {
  source         = "../../modules/vpc"
  name_prefix    = var.name_prefix        # ❌ Not expected
  vpc_cidr       = var.vpc_cidr          # ❌ Not expected  
  availability_zones = var.availability_zones # ❌ Not expected
  tags = local.common_tags               # ❌ Not expected
}

# ✅ Fixed (use correct variable names)
module "vpc" {
  source = "../../modules/vpc"
  
  # Use the correct variable names from the module
  cidr_block         = var.vpc_cidr
  availability_zones = var.availability_zones
  environment        = var.environment
  project_name       = var.project_name
  
  tags = local.common_tags
}
```

#### EKS Module Issues (Lines 91-100)
```hcl
# ❌ Current (incorrect attributes)
module "eks" {
  source = "../../modules/eks"
  name_prefix = var.eks_cluster_name     # ❌ Not expected
  cluster_version = var.eks_version      # ❌ Not expected
  # ... other incorrect attributes
}

# ✅ Fixed (use correct variable names)
module "eks" {
  source = "../../modules/eks"
  
  cluster_name    = var.eks_cluster_name
  cluster_version = var.eks_version
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  
  node_groups = var.eks_node_groups
  tags       = local.common_tags
}
```

### Steps to Fix Terraform Configuration

1. **Check Module Variables**: Verify what variables each module expects
```bash
cd terraform/modules/vpc
cat variables.tf

cd terraform/modules/eks  
cat variables.tf
```

2. **Update main.tf**: Fix the module calls to use correct variable names

3. **Validate Configuration**:
```bash
cd terraform/environments/production
terraform init
terraform validate
terraform plan
```

### Module Structure Verification

Ensure your modules have the correct structure:

```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   └── eks/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
└── environments/
    └── production/
        ├── main.tf
        ├── variables.tf
        ├── terraform.tfvars.example
        └── versions.tf
```

## Quick Fix Commands

```bash
# 1. Navigate to production environment
cd terraform/environments/production

# 2. Initialize Terraform (download providers and modules)
terraform init

# 3. Validate configuration
terraform validate

# 4. Check what will be created/changed
terraform plan

# 5. Apply changes (when ready)
terraform apply
```

## Common Terraform Issues and Solutions

### Issue: "terraform is not recognized"
**Solution**: Add Terraform to your PATH or use the full path to the executable.

### Issue: "Error loading modules"
**Solution**: Run `terraform init` to download required modules and providers.

### Issue: "Invalid attribute names"
**Solution**: Check the module's `variables.tf` file to see what inputs it expects.

### Issue: "Provider version conflicts"
**Solution**: Check `versions.tf` files and ensure compatible provider versions.

## AWS Credentials Setup

Before running Terraform, ensure AWS credentials are configured:

```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment Variables
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_DEFAULT_REGION="us-west-2"

# Option 3: AWS Credentials file
# Edit ~/.aws/credentials
```

## Next Steps

1. Install Terraform using one of the methods above
2. Fix the module attribute issues in `main.tf`
3. Run `terraform init` and `terraform validate`
4. Review and apply the infrastructure changes

## Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)
