# Nginx API Gateway

High-performance API Gateway using Nginx to replace the Express.js gateway.

## Features

- **High Performance**: Nginx-based reverse proxy
- **Rate Limiting**: Built-in request rate limiting
- **Load Balancing**: Upstream service load balancing
- **Security Headers**: CORS, XSS protection, content type validation
- **Health Checks**: Gateway and service health monitoring
- **Logging**: Detailed access and error logging

## Configuration

The gateway routes requests to:

- User Service: `/api/v1/auth/*` and `/api/v1/users/*`
- SMS Service: `/api/v1/sms/*`
- Insight Service: `/api/v1/insights/*` (future)

## Endpoints

- `GET /` - Gateway information
- `GET /health` - Health check
- `GET /nginx-health` - Internal health check (port 8090)
- `GET /users` - Legacy deprecation notice

## Usage

```bash
docker build -t nginx-gateway .
docker run -p 8080:8080 -p 8090:8090 nginx-gateway
```
