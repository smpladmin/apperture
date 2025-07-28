# Self-Hosted Deployment Guide

## Overview

This guide will walk you through setting up the entire system on your own infrastructure using AWS EC2 instances, Docker Swarm, and the necessary management tools. The deployment consists of six main phases:

1. **Infrastructure Setup** - Provisioning AWS resources using Pulumi
2. **Traefik Proxy Setup** - Setting up HTTPS load balancer and reverse proxy
3. **Swarmpit Setup** - Deploying cluster management UI
4. **CI/CD Pipeline Setup** - Automated container image building and deployment
5. **Core Application Stack** - Main application services and components
6. **Airflow Setup** - Workflow orchestration and data pipeline management

## Prerequisites

- AWS Account with appropriate permissions
- Domain name for your services
- Local machine with the following tools installed:
  - [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
  - [AWS CLI](https://aws.amazon.com/cli/) configured with your credentials
  - SSH client
  - Git

---

## Phase 1: Infrastructure Setup

### What Will Be Created

The infrastructure setup creates a complete AWS environment including:

- **VPC and Networking**: Virtual Private Cloud with public subnet, internet gateway, and routing
- **Security Groups**: Configured for Docker Swarm ports and web access
- **EC2 Instances**:
  - 1 Manager node (with Elastic IP)
  - Multiple Worker nodes (configurable)
  - 1 ClickHouse database instance (with dedicated EBS volume)
  - 1 Optional Jupyter instance
- **Storage**: EBS volumes for persistent data

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        VPC (10.0.0.0/16)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                Public Subnet                        │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │    │
│  │  │   Manager    │  │   Worker-1   │  │  Worker-N  │ │    │
│  │  │    Node      │  │     Node     │  │    Node    │ │    │
│  │  │ (Elastic IP) │  │              │  │            │ │    │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │    │
│  │                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐                │    │
│  │  │  ClickHouse  │  │   Jupyter    │                │    │
│  │  │    Node      │  │    Node      │                │    │
│  │  │ (+ EBS Vol)  │  │  (Optional)  │                │    │
│  │  └──────────────┘  └──────────────┘                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Clone and Setup Infrastructure

1. **Clone the project repository:**

   ```bash
   git clone https://github.com/canvasxai/apperture.git
   cd apperture/infra
   ```

2. **Review the infrastructure setup:**

   The repository includes a complete Pulumi infrastructure setup:

   - **[`Pulumi.yml`](https://github.com/canvasxai/apperture/blob/main/infra/Pulumi.yml)** - Main project configuration
   - **[`src/__main__.py`](https://github.com/canvasxai/apperture/blob/main/infra/src/__main__.py)** - Complete AWS infrastructure code
   - **[`Pulumi.production.yml`](https://github.com/canvasxai/apperture/blob/main/infra/Pulumi.production.yml)** - Production environment config
   - **[`pyproject.toml`](https://github.com/canvasxai/apperture/blob/main/infra/pyproject.toml)** - Python dependencies

### Step 2: Customize Configuration

Create your environment configuration file based on the production example:

```bash
cp Pulumi.production.yml Pulumi.dev.yml
```

Edit `Pulumi.dev.yml` and customize the following values:

```yaml
config:
  aws:region: us-east-1 # Your preferred AWS region
  apperture:data:
    vpc_name: "your-company-vpc"
    public_key: "ssh-rsa AAAAB3NzaC1yc2E... YOUR_PUBLIC_KEY_HERE"
    ec2_public_type: "t3.medium" # Adjust instance sizes as needed
    ec2_private_type: "t3.medium"
    ec2_private_count: 3 # Number of worker nodes
    ec2_clickhouse_type: "t3.large" # ClickHouse instance size
    # Update all resource names with your preferred naming convention
```

**Key parameters to customize:**

- `aws:region` - Your AWS region
- `public_key` - Your SSH public key for access
- Instance types and counts based on your requirements
- Resource names to match your naming conventions

### Step 3: Create IAM Role

Before deploying, create an IAM role for Docker Swarm nodes:

```bash
aws iam create-role --role-name DockerSwarmManager --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

aws iam attach-role-policy --role-name DockerSwarmManager --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

aws iam create-instance-profile --instance-profile-name DockerSwarmManager

aws iam add-role-to-instance-profile --instance-profile-name DockerSwarmManager --role-name DockerSwarmManager
```

### Step 4: Deploy Infrastructure

1. **Initialize Pulumi stack:**

   ```bash
   pulumi stack init dev
   ```

2. **Install Python dependencies:**

   ```bash
   # Using Poetry (recommended)
   poetry install
   poetry shell

   # Or using pip
   pip install pulumi pulumi-aws
   ```

3. **Deploy the infrastructure:**

   ```bash
   pulumi up
   ```

   Review the planned changes and confirm the deployment. This will create:

   - VPC with public subnet and networking
   - Security groups with Docker Swarm ports
   - EC2 instances (manager, workers, ClickHouse, Jupyter)
   - EBS volumes for persistent storage
   - Elastic IP for the manager node

4. **Note the manager IP:**
   ```bash
   pulumi stack output manager_public_ip
   ```

### Step 5: Set Up Docker Swarm

1. **SSH to the manager node:**

   ```bash
   ssh -i /path/to/your/private/key ubuntu@<manager_public_ip>
   ```

2. **Install Docker on all nodes:**

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker ubuntu
   ```

3. **Initialize Docker Swarm on manager:**

   ```bash
   sudo docker swarm init --advertise-addr <manager_private_ip>
   ```

4. **Get the join token and join worker nodes:**

   ```bash
   sudo docker swarm join-token worker
   ```

   Copy this command and run it on each worker node after installing Docker.

---

## Phase 2: Traefik Proxy Setup

Traefik will serve as your HTTPS reverse proxy and load balancer, automatically managing SSL certificates with Let's Encrypt.

### Step 1: Prepare Environment

SSH to your swarm manager node and set up the required network and environment:

```bash
# Create the public network for Traefik
docker network create --driver=overlay traefik-public

# Get the Swarm node ID and store it
export NODE_ID=$(docker info -f '{{.Swarm.NodeID}}')

# Label this node for Traefik certificate storage
docker node update --label-add traefik-public.traefik-public-certificates=true $NODE_ID

# Set your email for Let's Encrypt
export EMAIL=your-email@example.com

# Set your domain for Traefik UI
export DOMAIN=traefik.yourdomain.com

# Set username and password for Traefik UI
export USERNAME=admin
export PASSWORD=your-secure-password

# Generate hashed password
export HASHED_PASSWORD=$(openssl passwd -apr1 $PASSWORD)
```

### Step 2: Deploy Traefik

Download the Traefik configuration file from the DockerSwarm.rocks project:

```bash
curl -L dockerswarm.rocks/traefik.yml -o traefik.yml
```

This configuration file includes:

- Traefik v2.9 with Docker Swarm mode support
- Automatic HTTPS certificate generation with Let's Encrypt
- HTTP to HTTPS redirection
- Basic authentication for the Traefik dashboard
- Proper Docker Swarm placement constraints

For detailed information about the configuration, see the [official Traefik guide](https://dockerswarm.rocks/traefik/).

Deploy Traefik:

```bash
docker stack deploy -c traefik.yml traefik
```

### Step 3: Configure DNS

Point your domain to your manager node's public IP:

- `traefik.yourdomain.com` → Manager Public IP
- `*.yourdomain.com` → Manager Public IP (wildcard for all services)

### Step 4: Verify Traefik

1. Check if Traefik is running:

   ```bash
   docker service ls
   ```

2. Check logs:

   ```bash
   docker service logs traefik_traefik
   ```

3. Access Traefik dashboard:

   ```
   https://traefik.yourdomain.com
   ```

   Use the username and password you set earlier.

---

## Phase 3: Swarmpit Setup

Swarmpit provides a web-based UI for managing your Docker Swarm cluster.

### Step 1: Prepare for Swarmpit

```bash
# Set domain for Swarmpit
export DOMAIN=swarmpit.yourdomain.com

# Get node ID for database placement
export NODE_ID=$(docker info -f '{{.Swarm.NodeID}}')

# Label node for CouchDB data
docker node update --label-add swarmpit.db-data=true $NODE_ID

# Label node for InfluxDB data
docker node update --label-add swarmpit.influx-data=true $NODE_ID
```

### Step 2: Deploy Swarmpit

Download the Swarmpit configuration from the DockerSwarm.rocks project:

```bash
curl -L dockerswarm.rocks/swarmpit.yml -o swarmpit.yml
```

This configuration file includes:

- Swarmpit main application with web UI
- CouchDB for application data storage
- InfluxDB for cluster statistics and monitoring
- Swarmpit agent deployed on all nodes
- Traefik integration for HTTPS access
- Proper resource limits and placement constraints

For detailed information about the configuration, see the [official Swarmpit guide](https://dockerswarm.rocks/swarmpit/).

Deploy Swarmpit:

```bash
docker stack deploy -c swarmpit.yml swarmpit
```

### Step 3: Access Swarmpit

1. **Wait for deployment** (can take a few minutes):

   ```bash
   docker stack ps swarmpit
   ```

2. **Check logs if needed**:

   ```bash
   docker service logs swarmpit_app
   ```

3. **Access Swarmpit UI**:

   ```
   https://swarmpit.yourdomain.com
   ```

4. **Create admin account** on first visit.

---

## Phase 4: CI/CD Pipeline Setup

Before deploying applications to your Docker Swarm cluster, you need to set up a CI/CD pipeline to build and push Docker images to a container registry. This guide uses GitHub Actions with AWS ECR (Elastic Container Registry).

### CI/CD Architecture Overview

The pipeline automatically builds and pushes container images when code changes are detected:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline Flow                        │
├─────────────────────────────────────────────────────────────────┤
│  Code Push          │  Build Process         │  Image Registry  │
│  ├─ GitHub Push     │  ├─ Path Detection     │  ├─ AWS ECR       │
│  ├─ Branch: main    │  ├─ Docker Build       │  ├─ Image Tags    │
│  └─ Service Changes │  └─ Multi-Service      │  └─ Push Images   │
├─────────────────────┼────────────────────────┼───────────────────┤
│  Services Monitored │  Build Targets         │  Registry Output  │
│  ├─ backend/        │  ├─ Production Build   │  ├─ latest tag    │
│  ├─ frontend/       │  ├─ Optimized Images   │  ├─ commit-sha    │
│  ├─ airflow/        │  ├─ Multi-stage Build  │  └─ Auto-push     │
│  ├─ events_*/       │  └─ Parallel Jobs      │                   │
│  └─ 10+ Services    │                        │                   │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Set Up AWS ECR Repositories

First, create ECR repositories for each service:

```bash
# List of services that need ECR repositories
SERVICES=(
  "backend"
  "frontend"
  "airflow"
  "data_processor"
  "scheduler"
  "alertmanager"
  "events_producer"
  "events_consumer"
  "cdc_consumer"
  "event_logs_producer"
  "event_logs_consumer"
  "event_logs_consumer_v2"
  "events_config_consumer"
  "event_service_bus_consumer_producer"
)

# Create ECR repositories
for service in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name $service \
    --region your-aws-region \
    --image-scanning-configuration scanOnPush=true
done
```

### Step 2: Configure GitHub Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# AWS credentials for ECR access
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

**AWS IAM Policy for ECR Access:**

Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:BatchImportLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```

### Step 3: Set Up GitHub Actions Workflow

Create the GitHub Actions workflow file in your repository:

Download the CI/CD workflow file from: **[`.github/workflows/ci.yml`](https://github.com/canvasxai/apperture/blob/main/.github/workflows/ci.yml)**

```bash
mkdir -p .github/workflows
# Copy the content from the GitHub link above into .github/workflows/ci.yml
```

**Key features of the CI/CD pipeline:**

#### **1. Path-Based Filtering**

The pipeline only builds services when their code changes:

```yaml
- uses: dorny/paths-filter@v2
  id: filter
  with:
    filters: |
      backend:
        - 'backend/**'
      frontend:
        - 'frontend/**'
      airflow:
        - 'airflow/**'
      # ... other services
```

#### **2. Multi-Service Build Process**

Each service has its own build job that runs conditionally:

```yaml
- name: Build and Push Backend
  if: steps.filter.outputs.backend == 'true'
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: backend
    IMAGE_TAG: latest
  run: |
    cd backend
    docker build --target production -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY --all-tags
```

#### **3. Dual Tagging Strategy**

Images are tagged with both `latest` and short commit SHA:

```yaml
docker build --target production \
-t $ECR_REGISTRY/$ECR_REPOSITORY:latest \
-t $ECR_REGISTRY/$ECR_REPOSITORY:${{ steps.commit.outputs.sha_short }} .
```

### Step 4: Configure Service Dockerfiles

Each service needs a properly configured Dockerfile with a production target. Here's the general structure:

#### **Backend Service Example:**

```dockerfile
# Multi-stage build for production
FROM python:3.11-slim as base

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Development target
FROM base as development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]

# Production target
FROM base as production
RUN pip install --no-cache-dir gunicorn
CMD ["gunicorn", "main:app", "-k", "uvicorn.workers.UvicornWorker", "--host", "0.0.0.0", "--port", "8001"]
```

#### **Frontend Service Example:**

```dockerfile
FROM node:18-alpine as base

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# Development target
FROM base as development
CMD ["npm", "run", "dev"]

# Production target
FROM base as production
RUN npm run build
CMD ["npm", "start"]
```

### Step 5: Customize for Your Environment

Update the workflow file for your specific setup:

#### **1. Change AWS Region:**

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v1
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: your-preferred-region # Change from ap-south-1
```

#### **2. Update ECR Registry URLs:**

In your Docker Compose files, update the image URLs:

```yaml
services:
  backend:
    image: your-account-id.dkr.ecr.your-region.amazonaws.com/backend:latest
  frontend:
    image: your-account-id.dkr.ecr.your-region.amazonaws.com/frontend:latest
```

#### **3. Add Custom Services:**

If you have additional services, add them to the workflow:

```yaml
- uses: dorny/paths-filter@v2
  id: filter
  with:
    filters: |
      your_service:
        - 'your_service/**'

# Add corresponding build job
- name: Build and Push Your Service
  if: steps.filter.outputs.your_service == 'true'
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: your_service
    IMAGE_TAG: latest
  run: |
    cd your_service
    docker build --target production -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY --all-tags
```

### Step 6: Test the CI/CD Pipeline

1. **Initial Setup:**

   ```bash
   git add .github/workflows/ci.yml
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

2. **Monitor Build Process:**

   - Go to GitHub Actions tab in your repository
   - Watch the workflow execution
   - Check for any build errors

3. **Verify ECR Images:**

   ```bash
   # List images in ECR repository
   aws ecr list-images --repository-name backend --region your-region

   # Should show both 'latest' and commit-sha tags
   ```

### Step 7: Set Up Branch Protection (Optional)

Configure branch protection to ensure CI passes before merging:

```bash
# GitHub CLI example
gh api repos/your-org/your-repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["build"]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

### CI/CD Pipeline Features

#### **🚀 Automated Builds**

- **Triggered on:** Push to main branch, manual dispatch
- **Path Detection:** Only builds changed services
- **Parallel Execution:** Multiple services build simultaneously
- **Optimized:** Uses Docker layer caching

#### **📦 Image Management**

- **Registry:** AWS ECR with lifecycle policies
- **Tagging:** Dual strategy (latest + commit SHA)
- **Security:** Vulnerability scanning enabled
- **Cleanup:** Automatic old image removal

#### **🔒 Security & Best Practices**

- **Secrets Management:** GitHub encrypted secrets
- **IAM Permissions:** Least privilege access
- **Multi-stage Builds:** Optimized production images
- **Dependency Scanning:** Automated security checks

#### **📊 Monitoring & Debugging**

- **Build Logs:** Detailed execution logs in GitHub Actions
- **Failure Notifications:** Email alerts on build failures
- **Status Badges:** Build status in README
- **Metrics:** Build time and success rate tracking

### Troubleshooting CI/CD Pipeline

1. **Authentication Issues:**

   ```bash
   # Test ECR authentication locally
   aws ecr get-login-password --region your-region | \
     docker login --username AWS --password-stdin your-account.dkr.ecr.your-region.amazonaws.com
   ```

2. **Build Failures:**

   ```bash
   # Check service-specific issues
   - Missing Dockerfile
   - Invalid build target
   - Dependency installation failures
   - Environment variable issues
   ```

3. **Push Failures:**
   ```bash
   # Common ECR issues
   - Repository doesn't exist
   - Insufficient IAM permissions
   - Network connectivity issues
   - Image size limits exceeded
   ```

### Next Steps

After setting up the CI/CD pipeline:

1. **Test Each Service:** Make small changes to verify builds work
2. **Monitor Build Times:** Optimize slow builds with better caching
3. **Set Up Notifications:** Configure Slack/email for build status
4. **Branch Strategies:** Consider feature branch builds for testing

Your CI/CD pipeline is now ready to automatically build and push container images whenever you make changes to your services!

---

## Phase 5: Core Application Stack Setup

This is the main application deployment that includes all the core services: backend API, frontend web app, databases, message queues, and monitoring components.

> **Prerequisites:** Complete Phase 4 (CI/CD Pipeline Setup) first to build and push your container images to AWS ECR.

### Application Architecture Overview

The core stack consists of several interconnected services:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Core Application Stack                       │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js)     │  Backend API (FastAPI)                │
│  ├─ Web Application     │  ├─ Primary API (apiv1.apperture.io)  │
│  ├─ User Interface      │  ├─ Secondary API (api2.apperture.io) │
│  └─ Authentication      │  └─ Documentation & Admin             │
├─────────────────────────┼────────────────────────────────────────┤
│  Event Processing       │  Data & Storage                       │
│  ├─ Events Producer     │  ├─ ClickHouse Database               │
│  ├─ Events Consumer     │  ├─ MongoDB (External)                │
│  ├─ Kafka Message Queue │  └─ Redis Cache                       │
│  └─ Real-time Analytics │                                       │
├─────────────────────────┼────────────────────────────────────────┤
│  Monitoring & Alerts    │  External Integrations               │
│  ├─ Alert Manager       │  ├─ Google OAuth                      │
│  ├─ Slack Notifications │  ├─ AWS S3                            │
│  └─ System Health       │  └─ Various APIs                      │
└─────────────────────────────────────────────────────────────────┘
```

### Step 1: Prepare Application Prerequisites

Before deploying the core application, set up the required secrets and volumes:

1. **Create required volumes:**

   ```bash
   # Redis data persistence
   docker volume create apperture_redisdata

   # Kafka data persistence
   docker volume create kafka_data
   ```

2. **Create required secrets:**

   The application requires several secret files for sensitive configuration:

   ```bash
   # Alert Manager configuration
   docker secret create alert_manager.env /path/to/your/alert_manager.env

   # Events Producer configuration
   docker secret create events_producer1.env /path/to/your/events_producer.env

   # Frontend configuration
   docker secret create frontend.env /path/to/your/frontend.env
   ```

3. **Ensure required networks:**

   ```bash
   # These networks should exist from previous setup
   docker network ls | grep -E "(net|swarmpit_net|traefik-public)"

   # If the main overlay network doesn't exist, create it:
   docker network create --driver=overlay net
   ```

### Step 2: Configure the Application Stack

Download and customize the core application configuration:

Get the configuration file from: **[`apperture.yml`](https://github.com/canvasxai/apperture/blob/main/apperture.yml)**

**Key configurations to customize in `apperture.yml`:**

#### 1. **Container Registry**

Replace all ECR image URLs with your own registry:

```yaml
services:
  backend:
    image: your-registry/backend:latest # Replace ECR URL
  frontend:
    image: your-registry/frontend:latest
  alertmanager:
    image: your-registry/alertmanager:latest
  events_consumer:
    image: your-registry/events_consumer:latest
  events_producer:
    image: your-registry/events_producer:latest
```

#### 2. **Domain Configuration**

Update all domain references to match your setup:

```yaml
# Backend API domains
traefik.http.routers.backend-https.rule: Host(`api.yourdomain.com`)
traefik.http.routers.backend-docs.rule: Host(`api.yourdomain.com`) && PathPrefix(`/docs`)

# Frontend domain
traefik.http.routers.frontend-https.rule: Host(`app.yourdomain.com`)

# Events API domain
traefik.http.routers.events_producer-https.rule: Host(`events.yourdomain.com`)
```

#### 3. **External Database Configuration**

Update MongoDB connection strings and other external services:

```yaml
environment:
  # Replace with your MongoDB Atlas or self-hosted instance
  DB_URI: mongodb+srv://username:password@your-cluster.mongodb.net/your_database

  # Replace with your ClickHouse instance details
  CHDB_ADMIN_USERNAME: your_clickhouse_user
  CHDB_ADMIN_PASSWORD: your_clickhouse_password
```

#### 4. **Node Placement Constraints**

Update placement constraints to match your Docker Swarm nodes:

```yaml
deploy:
  placement:
    constraints:
      - node.hostname == your-worker-node-name # Replace worker1, worker3ch, etc.
```

### Step 3: Create Application Secrets

Create the required secret files with your specific configuration:

#### **Alert Manager Secrets (`alert_manager.env`):**

```bash
cat > alert_manager.env << EOF
# Slack webhook URLs for different alert types
SLACK_ENDPOINT=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
SLACK_ENDPOINT_CDC_INTERNAL_ALERTS=https://hooks.slack.com/services/YOUR/CDC/WEBHOOK
SLACK_ENDPOINT_WIOM_CDC_ALERTS=https://hooks.slack.com/services/YOUR/WIOM/WEBHOOK

# Swarmpit integration (optional)
SWARMPIT_AUTH_TOKEN=Bearer YOUR_SWARMPIT_JWT_TOKEN
SWARMPIT_ENDPOINT=https://swarmpit.yourdomain.com

# Alert thresholds
CPU_THRESHOLD=90
MEMORY_THRESHOLD=90
ALERT_MUTE_ITERATIONS=10
ENV=PRODUCTION
EOF

docker secret create alert_manager.env alert_manager.env
rm alert_manager.env
```

#### **Events Producer Secrets (`events_producer.env`):**

```bash
cat > events_producer.env << EOF
# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_TOPICS=clickstream,flutter_eventstream,gupshup_delivery_report,agent_log

# Database connections
BACKEND_API_KEY_NAME=your-api-key-name
BACKEND_API_KEY_SECRET=your-api-key-secret

# Additional service configurations
LOG_LEVEL=INFO
MAX_RECORDS=15000
TIMEOUT_MS=600000
EOF

docker secret create events_producer1.env events_producer.env
rm events_producer.env
```

#### **Frontend Secrets (`frontend.env`):**

```bash
cat > frontend.env << EOF
# Analytics and tracking
NEXT_APP_AMPLITUDE_API_KEY=your_amplitude_key
NEXT_APP_APPERTURE_PH_KEY=your_posthog_key

# External service integrations
GOOGLE_ANALYTICS_ID=your_ga_id
MIXPANEL_TOKEN=your_mixpanel_token

# Environment-specific configurations
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
EOF

docker secret create frontend.env frontend.env
rm frontend.env
```

### Step 4: Configure External Integrations

#### **Authentication & OAuth Setup:**

1. **Google OAuth Configuration:**

   - Create Google OAuth credentials
   - Update `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`
   - Set redirect URLs to your domains

2. **Slack Integration:**

   - Create Slack apps for notifications
   - Update all `SLACK_*` webhook URLs
   - Configure OAuth for Slack integrations

3. **MongoDB Setup:**
   - Set up MongoDB Atlas cluster or self-hosted instance
   - Create database user with appropriate permissions
   - Update `DB_URI` with connection string

#### **AWS Services Configuration:**

```yaml
environment:
  # S3 for file storage and backups
  AWS_ACCESS_KEY_ID: your_aws_access_key
  AWS_SECRET_ACCESS_KEY: your_aws_secret_key
  S3_BUCKET_NAME: your-s3-bucket
  S3_PATH: https://your-s3-bucket.s3.region.amazonaws.com/
```

### Step 5: Deploy the Core Application

Deploy the complete application stack:

```bash
docker stack deploy -c apperture.yml apperture
```

### Step 6: Monitor Deployment

Monitor the deployment progress:

```bash
# Check all services
docker stack ps apperture

# Monitor specific service logs
docker service logs apperture_backend
docker service logs apperture_frontend
docker service logs apperture_events_consumer
docker service logs apperture_kafka
docker service logs apperture_redis
```

Wait for all services to be in "Running" state:

```bash
# Should show all services as Running
docker service ls | grep apperture
```

### Step 7: Verify Application Access

1. **Frontend Application:**

   ```
   https://app.yourdomain.com
   ```

2. **Backend API:**

   ```
   https://api.yourdomain.com/health
   https://api.yourdomain.com/docs  # API documentation
   ```

3. **Events API:**
   ```
   https://events.yourdomain.com/health
   ```

### Step 8: Configure DNS Records

Add the following DNS records pointing to your manager node's public IP:

- `app.yourdomain.com` → Manager Public IP
- `api.yourdomain.com` → Manager Public IP
- `api2.yourdomain.com` → Manager Public IP
- `events.yourdomain.com` → Manager Public IP

Traefik will automatically handle HTTPS certificates for all these domains.

### Application Services Overview

#### **Core Services:**

- **Backend (2 instances):** FastAPI applications serving the main API
- **Frontend:** Next.js web application for the user interface
- **Events Producer:** API for receiving real-time events
- **Events Consumer:** Processes events from Kafka queue

#### **Infrastructure Services:**

- **ClickHouse:** High-performance analytics database
- **Kafka:** Message queue for event streaming
- **Redis:** Caching and session storage
- **Alert Manager:** System monitoring and alerting

#### **Production Features:**

- **High Availability:** Multiple replicas for critical services
- **Load Balancing:** Traefik distributes traffic across instances
- **Auto-scaling:** Resource limits and placement constraints
- **Health Monitoring:** Built-in health checks and alerting
- **Secure Communications:** HTTPS for all external endpoints
- **Secrets Management:** Encrypted configuration storage

### Troubleshooting Core Application

1. **Service Dependencies:**

   ```bash
   # Check if prerequisite services are running
   docker service ls | grep -E "(redis|kafka|clickhouse)"

   # Restart services in dependency order if needed
   docker service update --force apperture_redis
   docker service update --force apperture_kafka
   docker service update --force apperture_backend
   ```

2. **Database Connectivity:**

   ```bash
   # Test MongoDB connection
   docker service logs apperture_backend | grep -i mongo

   # Test ClickHouse connection
   docker service logs apperture_events_consumer | grep -i clickhouse
   ```

3. **Common Issues:**
   - **Secrets not found:** Ensure all required secrets are created
   - **Network connectivity:** Verify all networks exist and services can communicate
   - **Resource constraints:** Check if nodes have sufficient CPU/memory
   - **Domain resolution:** Verify DNS records point to correct IPs

---

## Phase 6: Airflow Setup

Apache Airflow provides workflow orchestration and data pipeline management. This is useful for ETL processes, data synchronization, and scheduled tasks like data marts.

> **Prerequisites:** Complete Phase 4 (CI/CD Pipeline Setup) to build the Airflow container image, and optionally Phase 5 for backend API integration.

### What Airflow Provides

- **Web-based UI** for managing and monitoring workflows
- **Scheduler** for running tasks on schedule
- **Worker nodes** for distributed task execution
- **Database backend** for storing workflow metadata
- **Integration** with various data sources and APIs

### Step 1: Prepare Airflow Prerequisites

Before deploying Airflow, you need to set up several prerequisites:

1. **Create required Docker secrets:**

   ```bash
   # Create the Airflow environment file with your specific configuration
   # This should contain sensitive environment variables
   echo "YOUR_AIRFLOW_ENV_VARIABLES" | docker secret create airflow_latest_1.env -
   ```

2. **Create required volumes:**

   ```bash
   # Create volume for PostgreSQL data persistence
   docker volume create postgres_data

   # Create volume for Airflow data (DAGs, logs, plugins)
   docker volume create airflow_data
   ```

3. **Ensure networks exist:**

   ```bash
   # These should already exist from Traefik setup
   docker network ls | grep -E "(apperture_net|traefik-public)"
   ```

### Step 2: Configure Airflow Environment

Download and customize the Airflow configuration:

Get the configuration file from: **[`airflow.yml`](https://github.com/canvasxai/apperture/blob/main/airflow.yml)**

**Key configurations to customize in `airflow.yml`:**

1. **Container Registry:** Replace ECR image URLs with your own registry:

   ```yaml
   image: your-registry/airflow:latest # Replace ECR URL
   ```

2. **Database Credentials:** Update PostgreSQL settings:

   ```yaml
   environment:
     POSTGRES_DB: airflow
     POSTGRES_USER: your_username # Change default credentials
     POSTGRES_PASSWORD: your_password # Use strong password
   ```

3. **External Services:** Configure your own service endpoints:

   ```yaml
   environment:
     # Replace with your backend API
     BACKEND_BASE_URL: http://your-backend:8001
     BACKEND_API_KEY_SECRET: your_api_key

     # Replace with your ClickHouse instance
     CH_HOST: your-clickhouse-host
     CH_USERNAME: your_username
     CH_PASSWORD: your_password

     # Configure your notification channels
     SLACK_URL_AIRFLOW_ALERTS: your_slack_webhook_url
   ```

4. **Node Placement:** Update node constraints for your cluster:
   ```yaml
   deploy:
     placement:
       constraints:
         - node.hostname == your-worker-node # Replace worker4
   ```

### Step 3: Create Airflow Secrets File

Create an environment file with your sensitive configuration:

```bash
# Create airflow.env file
cat > airflow.env << EOF
# Database Configuration
AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:your_password@postgres/airflow

# Redis Configuration (if using Redis)
AIRFLOW__CELERY__BROKER_URL=redis://:your_redis_password@redis:6379/0

# AWS S3 Configuration
S3_ACCESS_KEY_ID=your_aws_access_key
S3_SECRET_ACCESS_KEY=your_aws_secret_key

# Google Ads Configuration (if needed)
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token

# Slack Notification URLs
SLACK_URL_AIRFLOW_ALERTS=your_slack_webhook
SLACK_URL_WARNING_ALERTS=your_warning_webhook

# Backend API Configuration
BACKEND_API_KEY_NAME=your_api_key_name
BACKEND_API_KEY_SECRET=your_api_key_secret

# ClickHouse Configuration
CH_HOST=your_clickhouse_host
CH_USERNAME=your_ch_username
CH_PASSWORD=your_ch_password
EOF

# Create Docker secret from the file
docker secret create airflow_latest_1.env airflow.env

# Remove the file for security
rm airflow.env
```

### Step 4: Deploy Airflow

Deploy the Airflow stack:

```bash
docker stack deploy -c airflow.yml airflow
```

### Step 5: Initialize Airflow

The stack includes an initialization service that will:

- Check system requirements
- Set up the database
- Create default admin user
- Initialize directory structure

Monitor the initialization:

```bash
# Check if all services are running
docker stack ps airflow

# Check initialization logs
docker service logs airflow_airflow-init

# Wait for webserver to be ready
docker service logs airflow_airflow-webserver
```

### Step 6: Access Airflow

1. **Web Interface:**

   ```
   https://airflow.yourdomain.com
   ```

   Default credentials:

   - Username: `airflow`
   - Password: `airflow` (change this in production)

2. **Verify Services:**

   ```bash
   # Check all Airflow services
   docker service ls | grep airflow

   # Should show:
   # - airflow_airflow-init
   # - airflow_airflow-scheduler
   # - airflow_airflow-triggerer
   # - airflow_airflow-webserver
   # - airflow_airflow-worker
   # - airflow_postgres
   ```

### Step 7: Configure DNS

Add DNS record for Airflow access:

- `airflow.yourdomain.com` → Manager Public IP

The Traefik configuration in the stack will automatically handle HTTPS certificates.

### Key Features Included

The Airflow setup includes:

- **Multi-service Architecture:**

  - Scheduler for task orchestration
  - Worker nodes for task execution
  - Triggerer for deferred tasks
  - Web server for UI access
  - PostgreSQL for metadata storage

- **Production Features:**

  - Celery executor for distributed processing
  - Health checks and monitoring
  - Automatic restarts and scaling
  - Resource limits and placement constraints

- **Security:**

  - Secrets management for sensitive data
  - HTTPS access through Traefik
  - Environment-based configuration

- **Integrations:**
  - AWS S3 for data storage
  - Slack for notifications
  - Google Ads API integration
  - ClickHouse database connectivity
  - Custom backend API integration

### Troubleshooting Airflow

1. **Check service logs:**

   ```bash
   # Scheduler logs
   docker service logs airflow_airflow-scheduler

   # Webserver logs
   docker service logs airflow_airflow-webserver

   # Worker logs
   docker service logs airflow_airflow-worker
   ```

2. **Database connectivity:**

   ```bash
   # Check PostgreSQL
   docker service logs airflow_postgres

   # Connect to database
   docker exec -it $(docker ps -q -f name=airflow_postgres) psql -U airflow -d airflow
   ```

3. **Common issues:**
   - **Memory requirements:** Airflow needs at least 4GB RAM
   - **Secret not found:** Ensure `airflow_latest_1.env` secret exists
   - **Node constraints:** Update placement constraints for your nodes
   - **Network issues:** Verify `apperture_net` and `traefik-public` networks exist

---

## Next Steps

After completing all six phases, you'll have:

✅ A fully functional Docker Swarm cluster on AWS  
✅ Automatic HTTPS with Traefik and Let's Encrypt  
✅ Web-based cluster management with Swarmpit  
✅ Automated CI/CD pipeline with GitHub Actions and AWS ECR  
✅ Complete application stack with all core services  
✅ Workflow orchestration with Apache Airflow

### Deploying Your Applications

To deploy your applications, you can now:

1. **Using Swarmpit Web Interface:**

   - Navigate to **Stacks** in Swarmpit
   - Click **New Stack** and paste your Docker Compose YAML
   - Deploy with environment variables as needed

2. **Using Docker CLI:**

   ```bash
   # Deploy a stack from a compose file
   docker stack deploy -c your-app.yml your-app-name

   # Example: Deploy the main application stack (after setting up CI/CD)
   # 1. Download apperture.yml from: https://github.com/canvasxai/apperture/blob/main/apperture.yml
   # 2. Update image URLs to point to your ECR registry
   sed -i 's/212095042672.dkr.ecr.ap-south-1.amazonaws.com/your-account.dkr.ecr.your-region.amazonaws.com/g' apperture.yml
   docker stack deploy -c apperture.yml apperture

   # Deploy Airflow for data pipeline orchestration
   # 1. Download airflow.yml from: https://github.com/canvasxai/apperture/blob/main/airflow.yml
   # 2. Update image URLs to point to your ECR registry
   sed -i 's/212095042672.dkr.ecr.ap-south-1.amazonaws.com/your-account.dkr.ecr.your-region.amazonaws.com/g' airflow.yml
   docker stack deploy -c airflow.yml airflow
   ```

3. **Set up CI/CD pipelines** to automatically deploy to your cluster

### Application Stack Examples

Your repository contains several application stacks that you can deploy:

- **[Main Application](https://github.com/canvasxai/apperture/blob/main/apperture.yml):** `apperture.yml` - The core application services
- **[Airflow](https://github.com/canvasxai/apperture/blob/main/airflow.yml):** `airflow.yml` - Data pipeline orchestration
- **[CDC Consumer](https://github.com/canvasxai/apperture/blob/main/cdc.yml):** `cdc.yml` - Change data capture processing
- **[Staging Environment](https://github.com/canvasxai/apperture/blob/main/apperture-staging.yml):** `apperture-staging.yml` - Staging environment configuration

Each stack file is already configured with:

- Traefik labels for automatic HTTPS access
- Proper Docker Swarm placement constraints
- Resource limits and health checks
- Secrets and environment variable management

### Important Security Notes

- Change all default passwords
- Regularly update your systems and Docker images
- Consider setting up VPN access for management interfaces
- Monitor your infrastructure and set up appropriate alerting
- Back up your data regularly

### Support and Maintenance

- Monitor your cluster through Swarmpit
- Set up log aggregation for troubleshooting
- Consider implementing backup strategies for persistent data
- Plan for scaling your cluster as needed

---

## Troubleshooting

### Common Issues

1. **Traefik not getting certificates**: Check DNS configuration and ensure ports 80/443 are accessible
2. **Services not accessible**: Verify Traefik labels are correct and services are on the traefik-public network
3. **Swarm nodes not joining**: Check security group rules for Docker Swarm ports (2377, 7946, 4789)

### Getting Help

- Check Docker Swarm documentation: https://docs.docker.com/engine/swarm/
- Traefik documentation: https://doc.traefik.io/traefik/
- Swarmpit documentation: https://swarmpit.io/

---

> Other folders which are not explained in the above guide are not applicable to your specific usecase.
