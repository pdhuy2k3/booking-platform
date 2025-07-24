# 🚀 Server Deployment Guide for BookingSmart Platform

This guide explains how to deploy the BookingSmart platform on your server using Docker Hub images.

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed on your server
- **Git** installed
- **Internet connection** to pull Docker Hub images
- **Domain names** configured (optional)

## 🐳 Quick Server Deployment

### 1. Clone Repository (Configuration Files Only)

```bash
# Clone the repository
git clone https://github.com/pdhuy2k3/booking-platform.git
cd booking-platform

# Switch to Docker Hub deployment branch
git checkout feature/docker-hub-deployment
```

### 2. Set Environment Variables

Create a `.env` file with your configuration:

```bash
# Create environment file
cat > .env << EOF
# API Configuration
API_URL=https://api-bookingsmart.huypd.dev

# Database Configuration
DB_USERNAME=postgres
DB_PASSWORD=p0stgr3s

# Keycloak Configuration
JWT_ISSUER_URI=https://identity.huypd.dev/realms/BookingSmart
KEYCLOAK_HOST=https://identity.huypd.dev
KEYCLOAK_CLIENT_SECRET_BACKOFFICE_BFF=your-backoffice-secret
KEYCLOAK_CLIENT_SECRET_STOREFRONT_BFF=your-storefront-secret
KEYCLOAK_CLIENT_SECRET_CUSTOMER_MANAGEMENT=your-customer-secret

# Eureka Configuration
EUREKA_URI=http://discovery-service:8761/eureka

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:29092

# Cloudflare Tunnel (Optional)
CLOUDFLARE_TUNNEL_TOKEN=your-tunnel-token

# Server Ports (Optional - defaults are fine)
SERVER_PORT=80
EOF
```

### 3. Deploy with Production Images

```bash
# Deploy all services using Docker Hub images
docker-compose -f docker-compose.production.yml --profile app up -d

# Or use the simple override approach
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile app up -d
```

### 4. Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Check specific service
docker-compose -f docker-compose.production.yml logs -f booking-service
```

## 📊 Available Docker Images

All images are available on Docker Hub under `phamduyhuyuit/bookingsmart-*`:

### Backend Services
- `phamduyhuyuit/bookingsmart-discovery-service:latest`
- `phamduyhuyuit/bookingsmart-booking-service:latest`
- `phamduyhuyuit/bookingsmart-flight-service:latest`
- `phamduyhuyuit/bookingsmart-hotel-service:latest`
- `phamduyhuyuit/bookingsmart-payment-service:latest`
- `phamduyhuyuit/bookingsmart-customer-service:latest`
- `phamduyhuyuit/bookingsmart-notification-service:latest`

### BFF Services
- `phamduyhuyuit/bookingsmart-storefront-bff:latest`
- `phamduyhuyuit/bookingsmart-backoffice-bff:latest`

### Frontend Services
- `phamduyhuyuit/bookingsmart-storefront-fe:latest`
- `phamduyhuyuit/bookingsmart-backoffice-fe:latest`

### Optional Services
- `phamduyhuyuit/bookingsmart-media-service:latest`
- `phamduyhuyuit/bookingsmart-transport-service:latest`

## 🔧 Configuration Options

### Option 1: Full Production Deployment

```bash
# Use the complete production file with all configurations
docker-compose -f docker-compose.production.yml --profile app up -d
```

**Features:**
- ✅ All services from Docker Hub
- ✅ Complete infrastructure (PostgreSQL, Redis, Kafka, etc.)
- ✅ Nginx reverse proxy
- ✅ Keycloak authentication
- ✅ Cloudflare tunnel support

### Option 2: Override Existing Configuration

```bash
# Use existing docker-compose.yml with production image override
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile app up -d
```

**Features:**
- ✅ Uses your existing docker-compose.yml configuration
- ✅ Overrides only the image sources to use Docker Hub
- ✅ Maintains all your custom settings

### Option 3: Selective Service Deployment

```bash
# Deploy only specific services
docker-compose -f docker-compose.production.yml up -d postgres redis kafka discovery-service booking-service flight-service hotel-service
```

## 🌐 Service Access

After deployment, services will be available at:

| Service | URL | Description |
|---------|-----|-------------|
| **Storefront** | http://localhost:3000 | Customer web application |
| **Backoffice** | http://localhost:3001 | Admin web application |
| **API Gateway** | http://localhost:80 | Nginx reverse proxy |
| **Keycloak** | http://localhost:9090 | Authentication service |
| **Kafka UI** | http://localhost:8091 | Kafka management |
| **N8N** | http://localhost:5678 | Workflow automation |

## 🔍 Monitoring and Troubleshooting

### Check Service Health

```bash
# View all running containers
docker ps

# Check service logs
docker-compose -f docker-compose.production.yml logs -f [service-name]

# Check resource usage
docker stats

# Check network connectivity
docker network ls
docker network inspect booking-network
```

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs for errors
docker-compose -f docker-compose.production.yml logs [service-name]

# Restart specific service
docker-compose -f docker-compose.production.yml restart [service-name]
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL is healthy
docker-compose -f docker-compose.production.yml exec postgres pg_isready

# Check database logs
docker-compose -f docker-compose.production.yml logs postgres
```

#### 3. Image Pull Issues
```bash
# Manually pull images
docker pull phamduyhuyuit/bookingsmart-booking-service:latest

# Check Docker Hub connectivity
docker search phamduyhuyuit
```

### Performance Tuning

#### Resource Limits
```yaml
# Add to service definition in docker-compose.production.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

#### Scaling Services
```bash
# Scale specific services
docker-compose -f docker-compose.production.yml up -d --scale booking-service=2 --scale flight-service=2
```

## 🔄 Updates and Maintenance

### Update to Latest Images

```bash
# Pull latest images
docker-compose -f docker-compose.production.yml pull

# Restart with new images
docker-compose -f docker-compose.production.yml up -d
```

### Update to Specific Version

```bash
# Edit docker-compose.production.yml to change :latest to :v1.0.0
sed -i 's/:latest/:v1.0.0/g' docker-compose.production.yml

# Deploy with new version
docker-compose -f docker-compose.production.yml up -d
```

### Backup and Restore

```bash
# Backup database
docker-compose -f docker-compose.production.yml exec postgres pg_dumpall -U postgres > backup.sql

# Backup volumes
docker run --rm -v booking-platform_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore database
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres < backup.sql
```

## 🚨 Production Considerations

### Security
- Change default passwords in `.env` file
- Use HTTPS with proper SSL certificates
- Configure firewall rules
- Enable Docker security scanning

### High Availability
- Use Docker Swarm or Kubernetes for clustering
- Set up load balancers
- Configure health checks
- Implement backup strategies

### Monitoring
- Set up log aggregation (ELK stack)
- Configure metrics collection (Prometheus)
- Set up alerting (Grafana)
- Monitor resource usage

## 📞 Support

For deployment issues:
1. Check the troubleshooting section above
2. Review service logs for error messages
3. Verify environment variables are set correctly
4. Ensure all required ports are available
5. Check Docker Hub for image availability

## 🎯 Quick Commands Reference

```bash
# Deploy everything
docker-compose -f docker-compose.production.yml --profile app up -d

# Stop everything
docker-compose -f docker-compose.production.yml down

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Update images
docker-compose -f docker-compose.production.yml pull && docker-compose -f docker-compose.production.yml up -d

# Clean up
docker-compose -f docker-compose.production.yml down -v --remove-orphans
docker system prune -a
```
