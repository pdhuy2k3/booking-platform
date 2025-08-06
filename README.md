# BookingSmart - Nx Monorepo

BookingSmart là một nền tảng đặt chỗ microservices được xây dựng với Spring Boot backend, Nuxt.js frontend, và được quản lý bằng Nx workspace để tối ưu hóa developer experience.

## 🏗️ Kiến trúc hệ thống

```text
bookingsmart/
├── apps/                           # Frontend applications
│   ├── storefront-fe/             # Customer-facing frontend (Nuxt.js)
│   └── backoffice-fe/             # Admin dashboard (Nuxt.js)
├── libs/                          # Shared libraries
│   └── nuxt-api-module/           # Shared API module
├── services/spring-backend/       # Backend microservices
│   ├── common-lib/                # Shared business logic
│   ├── discovery-service/         # Eureka service registry
│   ├── flight-service/            # Flight booking service
│   ├── hotel-service/             # Hotel booking service
│   ├── booking-service/           # Main booking orchestration
│   ├── customer-service/          # Customer management
│   ├── payment-service/           # Payment processing
│   ├── notification-service/      # Notifications
│   ├── backoffice-bff/           # Backend for Frontend (Admin)
│   └── storefront-bff/           # Backend for Frontend (Customer)
└── infrastructure/               # Docker, Nginx, databases
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ và npm
- **Java** 21+ và Maven 3.9+
- **Docker** và Docker Compose
- **Git**

### 1. Clone và cài đặt dependencies

```bash
git clone https://github.com/pdhuy2k3/booking-platform.git
cd bookingsmart
npm install
```

### 2. Khởi động infrastructure

```bash
# Start databases và services cơ bản
docker-compose --profile dev up -d

# Hoặc khởi động full application
docker-compose --profile app up -d
```

## 🛠️ Development Commands

### Build Commands

```bash
# Build tất cả backend services (Maven only)
nx run-many --target=build --projects=tag:microservice

# Build tất cả frontend apps
nx run-many --target=build --projects=tag:frontend

# Build toàn bộ project
nx run-many --target=build --all

# Build một service cụ thể
nx run flight-service:build
nx run storefront-fe:build
```

### Docker Commands

```bash
# Build Docker images cho tất cả microservices
nx run-many --target=docker-build --projects=tag:microservice

# Build Docker image cho một service
nx run flight-service:docker-build

# Run container (cho development/testing)
nx run flight-service:docker-run
nx run discovery-service:docker-run  # Expose port 8761 for Eureka
```

### Development Server

```bash
# Start development server cho frontend
nx run storefront-fe:dev
nx run backoffice-fe:dev

# Start Spring Boot service trong development mode
nx run flight-service:dev
nx run hotel-service:dev
```

### Testing

```bash
# Run tests cho tất cả projects
nx run-many --target=test --all

# Run tests cho backend services
nx run-many --target=test --projects=tag:microservice

# Run test cho một project cụ thể
nx run flight-service:test
nx run storefront-fe:test
```

## 🏷️ Nx Tags và Project Organization

Projects được tổ chức theo tags để dễ dàng quản lý:

- **`tag:backend`** - Tất cả backend services
- **`tag:frontend`** - Tất cả frontend applications  
- **`tag:microservice`** - Spring Boot microservices
- **`tag:library`** - Shared libraries
- **`tag:spring-boot`** - Spring Boot applications

### Sử dụng tags

```bash
# Build tất cả backend
nx run-many --target=build --projects=tag:backend

# Build tất cả microservices
nx run-many --target=build --projects=tag:microservice

# Test tất cả frontend
nx run-many --target=test --projects=tag:frontend
```

## 📦 Available Targets

### Backend Services (Spring Boot)

| Target | Mô tả | Example |
|--------|-------|---------|
| `build` | Build Maven project | `nx run flight-service:build` |
| `test` | Run Maven tests | `nx run flight-service:test` |
| `docker-build` | Build Docker image | `nx run flight-service:docker-build` |
| `docker-run` | Run Docker container | `nx run flight-service:docker-run` |
| `dev` | Start development server | `nx run flight-service:dev` |

### Frontend Apps (Nuxt.js)

| Target | Mô tả | Example |
|--------|-------|---------|
| `build` | Build for production | `nx run storefront-fe:build` |
| `dev` | Start development server | `nx run storefront-fe:dev` |
| `test` | Run unit tests | `nx run storefront-fe:test` |
| `lint` | Run ESLint | `nx run storefront-fe:lint` |

## 🐳 Docker Deployment

### Development với Docker Compose

```bash
# Start infrastructure only (databases, redis, etc.)
docker-compose --profile dev up -d

# Start full application stack
docker-compose --profile app up -d

# Start với authentication services
docker-compose --profile auth up -d

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down
```

### Docker Images

Tất cả microservices sử dụng format tên image: `phamduyhuyuit/bookingsmart-{service-name}:latest`

Ví dụ:

- `phamduyhuyuit/bookingsmart-flight-service:latest`
- `phamduyhuyuit/bookingsmart-hotel-service:latest`
- `phamduyhuyuit/bookingsmart-booking-service:latest`

## 🔧 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-booking-flow

# Start development environment
docker-compose --profile dev up -d

# Start specific services you're working on
nx run flight-service:dev
nx run storefront-fe:dev

# Make your changes...

# Build và test
nx run flight-service:build
nx run flight-service:test
```

### 2. Testing Changes

```bash
# Build Docker image với changes
nx run flight-service:docker-build

# Test với Docker Compose
docker-compose up -d flight-service

# Run integration tests
nx run-many --target=test --projects=tag:microservice
```

### 3. Deployment

```bash
# Build tất cả images cho production
nx run-many --target=docker-build --projects=tag:microservice

# Deploy với Docker Compose
docker-compose --profile app up -d
```

## 📊 Nx Cache và Performance

Nx provide intelligent caching để tăng tốc builds:

```bash
# Xem cache status
nx show projects

# Clear cache nếu cần
nx reset

# View detailed build information
nx run flight-service:build --verbose
```

## 🔍 Troubleshooting

### Common Issues

1. **Maven build fails**

   ```bash
   # Clean và rebuild
   nx run flight-service:build --skip-cache
   ```

2. **Docker build issues**

   ```bash
   # Rebuild without cache
   docker build --no-cache -t phamduyhuyuit/bookingsmart-flight-service:latest services/spring-backend/flight-service
   ```

3. **Port conflicts**

   ```bash
   # Check running containers
   docker ps
   
   # Stop conflicting services
   docker-compose down
   ```

### Logs và Debugging

```bash
# View Nx task logs
nx run flight-service:build --verbose

# View Docker Compose logs
docker-compose logs -f flight-service

# Debug Spring Boot application
nx run flight-service:dev --debug
```

## 📚 Additional Resources

- [Nx Documentation](https://nx.dev)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Nuxt.js Documentation](https://nuxt.com)
- [Docker Documentation](https://docs.docker.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
