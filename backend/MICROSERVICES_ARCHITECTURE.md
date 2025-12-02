# Microservices Architecture

## Overview

The Hypz backend now supports both **monolith** and **microservices** deployment modes. By default, all services run together in a single process, but you can easily split them into separate servers.

## Architecture Components

### 1. Service Registry (`ServiceRegistry.js`)

Central registry that manages all services:

-   Service registration and discovery
-   Dependency management
-   Health monitoring
-   Lifecycle management (start/stop)
-   Route management

### 2. Core Services

#### **Auth Service** (`AuthService.js`)

Handles authentication and authorization:

-   User login/register
-   JWT token management
-   2FA operations
-   OAuth integration
-   API key management

**Routes:**

-   `/api/v1/auth/*`
-   `/api/v1/oauth/*`

**Dependencies:** None (base service)

---

#### **Storage Service** (`StorageService.js`)

Manages file storage and buckets:

-   File upload/download
-   Bucket management
-   B2 integration
-   CDN operations
-   Versioning

**Routes:**

-   `/api/v1/files/*`
-   `/api/v1/buckets/*`
-   `/api/v1/multipart/*`
-   `/api/v1/presigned/*`

**Dependencies:** Auth Service

---

#### **Payment Service** (`PaymentService.js`)

Handles payments and subscriptions:

-   Skydo integration
-   Subscription management
-   Invoice generation
-   Usage billing
-   Webhook handling

**Routes:**

-   `/api/v1/payments/*`
-   `/api/v1/subscriptions/*`

**Dependencies:** Auth Service

---

## Deployment Modes

### Monolith Mode (Default)

All services run in a single Node.js process.

```javascript
// In server.js
await bootstrapServices("monolith");
```

**Pros:**

-   Simple deployment
-   Lower infrastructure costs
-   Easy debugging
-   No network overhead between services

**Cons:**

-   Single point of failure
-   Cannot scale individual services
-   All services must use same technology stack

---

### Microservices Mode

Each service runs as a separate Node.js process on different ports.

```javascript
// In server.js
await bootstrapServices("microservice");
```

**Environment Variables:**

```bash
AUTH_SERVICE_PORT=3001
STORAGE_SERVICE_PORT=3002
PAYMENT_SERVICE_PORT=3003
```

**Pros:**

-   Independent scaling
-   Fault isolation
-   Technology diversity
-   Independent deployment

**Cons:**

-   More complex deployment
-   Network latency
-   Distributed debugging
-   Higher infrastructure costs

---

## Service Communication

### In Monolith Mode

Services communicate via direct function calls (no network overhead).

### In Microservice Mode

Services communicate via:

-   REST APIs
-   Service discovery via registry
-   Health checks

---

## Monitoring & Management

### Admin Endpoints

All service management endpoints require **admin authentication**.

#### Get All Services Status

```bash
GET /api/v1/services/services/status
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
    "success": true,
    "data": {
        "services": {
            "auth": {
                "status": "running",
                "startedAt": "2025-12-02T10:00:00Z",
                "uptime": 3600000,
                "dependencies": []
            },
            "storage": {
                "status": "running",
                "startedAt": "2025-12-02T10:00:01Z",
                "uptime": 3599000,
                "dependencies": ["auth"]
            },
            "payment": {
                "status": "running",
                "startedAt": "2025-12-02T10:00:02Z",
                "uptime": 3598000,
                "dependencies": ["auth"]
            }
        },
        "totalServices": 3,
        "runningServices": 3
    }
}
```

---

#### Get All Services Health

```bash
GET /api/v1/services/services/health
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
    "success": true,
    "data": {
        "health": {
            "auth": {
                "healthy": true,
                "service": "auth",
                "timestamp": "2025-12-02T11:00:00Z"
            },
            "storage": {
                "healthy": true,
                "service": "storage",
                "storage": {
                    "b2Available": true,
                    "localStorageAvailable": true
                }
            },
            "payment": {
                "healthy": true,
                "service": "payment",
                "payment": {
                    "provider": "skydo",
                    "providerConfigured": true
                }
            }
        },
        "overall": "healthy"
    }
}
```

---

#### Get Service Metrics

```bash
GET /api/v1/services/services/{serviceName}/metrics
Authorization: Bearer <admin-token>
```

**Example for Storage Service:**

```json
{
    "success": true,
    "data": {
        "service": "storage",
        "metrics": {
            "totalFiles": 1523,
            "totalBuckets": 45,
            "totalStorageBytes": 5368709120,
            "last24hUploads": 127,
            "b2Available": true,
            "isRunning": true
        }
    }
}
```

---

#### Restart Service

```bash
POST /api/v1/services/services/{serviceName}/restart
Authorization: Bearer <admin-token>
```

---

#### System Overview

```bash
GET /api/v1/services/system/overview
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
    "success": true,
    "data": {
        "services": {
            "total": 3,
            "running": 3,
            "stopped": 0,
            "error": 0
        },
        "health": {
            "healthy": 3,
            "unhealthy": 0,
            "overall": "healthy"
        },
        "uptime": 7200,
        "memory": {
            "rss": 52428800,
            "heapTotal": 20971520,
            "heapUsed": 15728640
        }
    }
}
```

---

## Configuration

### Environment Variables

```bash
# Service Mode
SERVICE_MODE=monolith  # or 'microservice'

# Microservice Ports (only needed in microservice mode)
AUTH_SERVICE_PORT=3001
STORAGE_SERVICE_PORT=3002
PAYMENT_SERVICE_PORT=3003

# Feature Flags
ENABLE_OAUTH=false
ENABLE_2FA=true
ENABLE_CDN=true
ENABLE_VERSIONING=true
MAX_FILE_SIZE=5368709120  # 5GB
```

---

## Development

### Running in Monolith Mode

```bash
npm start
# All services start on PORT (default: 3000)
```

### Running in Microservice Mode

```bash
# Terminal 1 - Auth Service
SERVICE_MODE=microservice AUTH_SERVICE_PORT=3001 npm start

# Terminal 2 - Storage Service
SERVICE_MODE=microservice STORAGE_SERVICE_PORT=3002 npm start

# Terminal 3 - Payment Service
SERVICE_MODE=microservice PAYMENT_SERVICE_PORT=3003 npm start
```

---

## Health Checks

Each service exposes health check endpoints:

```bash
# Main health check
GET /health

# Service-specific health
GET /api/v1/services/services/{serviceName}/health
```

---

## Graceful Shutdown

All services support graceful shutdown:

```bash
# Send SIGTERM or SIGINT
kill -TERM <pid>
```

**Shutdown sequence:**

1. Stop accepting new requests
2. Stop services in reverse dependency order:
    - Payment Service
    - Storage Service
    - Auth Service
3. Close database connections
4. Exit process

---

## Best Practices

### 1. Service Independence

-   Each service has its own database schema
-   Services communicate via well-defined APIs
-   No shared state between services

### 2. Error Handling

-   Each service handles its own errors
-   Failed services don't crash other services
-   Circuit breaker pattern for service-to-service calls

### 3. Monitoring

-   Use `/services/health` for liveness probes
-   Use `/services/status` for readiness probes
-   Monitor service metrics regularly

### 4. Scaling

-   Scale services independently based on load
-   Use load balancers for microservice mode
-   Consider message queues for async operations

---

## Migration Path

### Phase 1: Monolith (Current)

All services run together in one process.

### Phase 2: Hybrid

Keep auth and storage as monolith, extract payment service.

### Phase 3: Full Microservices

All services run independently.

### Phase 4: Kubernetes

Deploy services as Kubernetes pods with auto-scaling.

---

## Troubleshooting

### Service Won't Start

Check dependencies: Ensure dependent services are running first.

```bash
# Check service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/services/services/status
```

### Service Unhealthy

Check health endpoint:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/services/services/{serviceName}/health
```

### High Memory Usage

Check system overview:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/services/system/overview
```

---

## Future Enhancements

1. **Message Queue Integration** (RabbitMQ/Redis)

    - Async event processing
    - Service-to-service messaging

2. **API Gateway**

    - Request routing
    - Rate limiting
    - Authentication

3. **Service Mesh** (Istio/Linkerd)

    - Traffic management
    - Security
    - Observability

4. **Distributed Tracing** (Jaeger/Zipkin)

    - Request tracking across services
    - Performance monitoring

5. **Configuration Service**
    - Centralized configuration
    - Dynamic updates

---

## Summary

✅ **Fixed:** File download authorization (now uses Authorization header)
✅ **Created:** Microservices architecture with service registry
✅ **Added:** Service monitoring and health check endpoints
✅ **Supports:** Both monolith and microservice deployment modes
✅ **Admin:** Full service management via API

The system is now **production-ready** with a clean, scalable architecture that can grow from a simple monolith to full microservices as needed.
