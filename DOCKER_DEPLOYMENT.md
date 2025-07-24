# 🐳 Docker Hub Deployment Guide

This guide explains how to build and deploy all BookingSmart services to Docker Hub using Python scripts.

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
# Required: Your Docker Hub username
export DOCKER_HUB_USERNAME="phamduyhuyuit"

# Optional: Docker Hub token for automated login
export DOCKER_HUB_TOKEN="your-token"
```

### 2. Deploy All Services

```bash
# Deploy all services with latest tag
python docker_deploy.py --username phamduyhuyuit

# Deploy with specific version
python docker_deploy.py --username phamduyhuyuit --version v1.0.0
```

### 3. Deploy Single Service

```bash
# Deploy specific service
python docker_deploy.py --username phamduyhuyuit --service booking-service

# Deploy with custom version
python docker_deploy.py --username phamduyhuyuit --service storefront-fe --version v1.0.0
```

## 📚 Available Commands

### Main Deployment Script

```bash
# Show help
python docker_deploy.py --help

# List available services
python docker_deploy.py --list-services

# Deploy all services
python docker_deploy.py --username pdhuy2k3

# Deploy with custom registry
python docker_deploy.py --username pdhuy2k3 --registry your-registry.com

# Deploy single service
python docker_deploy.py --username pdhuy2k3 --service booking-service --version v1.0.0
```

### Configuration Generator

```bash
# Generate all configuration files
python docker_config.py --username pdhuy2k3 --version v1.0.0

# Generate only Docker Compose production file
python docker_config.py --type compose --username pdhuy2k3

# Generate only Kubernetes manifests
python docker_config.py --type k8s --username pdhuy2k3

# Generate only Docker Swarm stack
python docker_config.py --type stack --username pdhuy2k3
```

## 🏗️ Services Architecture

### Backend Services (Java/Spring Boot)
- `discovery-service` - Eureka service discovery
- `booking-service` - Main booking orchestration
- `flight-service` - Flight inventory management
- `hotel-service` - Hotel inventory management
- `payment-service` - Payment processing
- `customer-service` - Customer management
- `notification-service` - Email/SMS notifications
- `media-service` - File upload/management
- `transport-service` - Transportation services

### BFF Services (Backend for Frontend)
- `storefront-bff` - Customer-facing API gateway
- `backoffice-bff` - Admin-facing API gateway

### Frontend Services (Next.js)
- `storefront-fe` - Customer web application
- `backoffice-fe` - Admin web application

## 🐳 Docker Images

All images are built with the following naming convention:
```
{registry}/{username}/bookingsmart-{service}:{version}
```

Examples:
- `docker.io/pdhuy2k3/bookingsmart-booking-service:latest`
- `docker.io/pdhuy2k3/bookingsmart-storefront-fe:v1.0.0`

## 📦 Deployment Options

### 1. Docker Compose (Development/Testing)

```bash
# Generate production compose file
python docker_config.py --type compose --username pdhuy2k3

# Run with production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

### 2. Docker Swarm (Production)

```bash
# Generate swarm stack file
python docker_config.py --type stack --username pdhuy2k3

# Deploy to swarm
docker stack deploy -c docker-stack.yml bookingsmart
```

### 3. Kubernetes (Production)

```bash
# Generate Kubernetes manifests
python docker_config.py --type k8s --username pdhuy2k3

# Deploy to Kubernetes
kubectl apply -f k8s/
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username | `pdhuy2k3` |
| `DOCKER_HUB_TOKEN` | Docker Hub access token | None |
| `REGISTRY` | Docker registry URL | `docker.io` |

### Script Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--username` | Docker Hub username | `pdhuy2k3` |
| `--version` | Image version tag | `latest` |
| `--registry` | Docker registry | `docker.io` |
| `--service` | Single service to deploy | None (all) |

## 🚨 Troubleshooting

### Common Issues

1. **Docker not running**
   ```bash
   # Start Docker Desktop or Docker daemon
   sudo systemctl start docker  # Linux
   ```

2. **Maven build fails**
   ```bash
   # Clean and rebuild
   mvn clean install -DskipTests
   ```

3. **Docker login fails**
   ```bash
   # Manual login
   docker login
   
   # Or use token
   echo $DOCKER_HUB_TOKEN | docker login --username $DOCKER_HUB_USERNAME --password-stdin
   ```

4. **Frontend build fails**
   ```bash
   # Install dependencies
   cd storefront-fe && pnpm install
   cd ../backoffice-fe && pnpm install
   ```

### Build Logs

The script provides detailed logs for each step:
- ✅ **[SUCCESS]** - Operation completed successfully
- ℹ️ **[INFO]** - Information message
- ⚠️ **[WARNING]** - Warning message
- ❌ **[ERROR]** - Error message

## 📊 Monitoring Deployment

### Check Deployed Images

```bash
# List your Docker Hub repositories
curl -s "https://hub.docker.com/v2/repositories/${DOCKER_HUB_USERNAME}/?page_size=100" | jq '.results[].name'

# Check specific image tags
curl -s "https://hub.docker.com/v2/repositories/${DOCKER_HUB_USERNAME}/bookingsmart-booking-service/tags/" | jq '.results[].name'
```

### Verify Images Locally

```bash
# Pull and test an image
docker pull pdhuy2k3/bookingsmart-booking-service:latest
docker run --rm pdhuy2k3/bookingsmart-booking-service:latest --help
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Docker Hub
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Docker Hub
      env:
        DOCKER_HUB_USERNAME: ${{ secrets.DOCKER_HUB_USERNAME }}
        DOCKER_HUB_TOKEN: ${{ secrets.DOCKER_HUB_TOKEN }}
      run: |
        python docker_deploy.py --username $DOCKER_HUB_USERNAME --version ${GITHUB_REF#refs/tags/}
```

## 📝 Notes

- **Build Time**: Full deployment takes 15-30 minutes depending on your internet connection
- **Image Sizes**: Backend services ~200MB, Frontend services ~150MB each
- **Resource Usage**: Ensure you have at least 4GB RAM and 10GB disk space
- **Network**: Fast internet connection recommended for pushing large images

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check Docker Hub permissions
4. Review build logs for specific errors

For additional help, please check the project documentation or create an issue.
