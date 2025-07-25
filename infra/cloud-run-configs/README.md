# Cloud Run Deployment Configurations

This directory contains configuration files and scripts for deploying NeatSpend microservices to Google Cloud Run.

## Overview

Google Cloud Run is a fully managed platform that automatically scales stateless containers. It's an ideal platform for deploying NeatSpend microservices due to its:

- Automatic scaling (including scale to zero)
- Pay-per-use pricing model
- Managed infrastructure
- Built-in security features
- Integration with Google Cloud ecosystem

## Deployment Architecture

```
                                   ┌─────────────────┐
                                   │                 │
                                   │  Cloud Run      │
┌──────────────┐    ┌──────────┐   │  ┌───────────┐  │
│              │    │          │   │  │           │  │
│  Cloud Load  │    │  Cloud   │   │  │ neatspend │  │
│  Balancer    ├────┤  Run API ├───┼──┤    api    │  │
│              │    │  Gateway │   │  │           │  │
└──────────────┘    └──────────┘   │  └───────────┘  │
                                   │                 │
                                   │  ┌───────────┐  │
                                   │  │   user    │  │
                                   │  │  service  │  │
                                   │  └───────────┘  │
                                   │                 │
                                   │  ┌───────────┐  │
                                   │  │    sms    │  │
                                   │  │  worker   │  │
                                   │  └───────────┘  │
                                   │                 │
                                   │  ┌───────────┐  │
                                   │  │    ai     │  │
                                   │  │  insight  │  │
                                   │  └───────────┘  │
                                   │                 │
                                   └─────────────────┘
```

## Service Configuration Files

Each service will have its own Cloud Run configuration file:

- `user-service.yaml` - User management service
- `neatspend-api.yaml` - API Gateway service
- `sms-sync-worker.yaml` - SMS processing service
- `ai-insight-service.yaml` - AI insights service

## Deployment Process

### Prerequisites

1. Google Cloud SDK installed and configured
2. Docker images built and pushed to Google Container Registry (GCR) or Artifact Registry
3. Required IAM permissions for Cloud Run deployment

### Deployment Steps

```bash
# 1. Build and tag Docker image
docker build -t gcr.io/[PROJECT_ID]/user-service:latest ./services/user-service

# 2. Push to Google Container Registry
docker push gcr.io/[PROJECT_ID]/user-service:latest

# 3. Deploy to Cloud Run using configuration
gcloud run services replace user-service.yaml

# 4. Set environment variables (if not in YAML)
gcloud run services update user-service \
  --set-env-vars="DATABASE_URL=postgresql://user:pass@host:5432/db"
```

## Environment Configuration

Each service requires specific environment variables for production deployment:

### User Service
```yaml
env:
  - name: NODE_ENV
    value: "production"
  - name: PORT
    value: "8080"
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: user-service-secrets
        key: database-url
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: user-service-secrets
        key: jwt-secret
```

### API Gateway
```yaml
env:
  - name: NODE_ENV
    value: "production"
  - name: PORT
    value: "8080"
  - name: USER_SERVICE_URL
    value: "https://user-service-xxxxx-uc.a.run.app"
```

## Secrets Management

Sensitive information is stored in Google Secret Manager:

```bash
# Create a secret
gcloud secrets create user-service-database-url --replication-policy="automatic"

# Add secret version
echo -n "postgresql://user:pass@host:5432/db" | \
  gcloud secrets versions add user-service-database-url --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding user-service-database-url \
  --member="serviceAccount:service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Networking

Services communicate with each other using Cloud Run's built-in service-to-service authentication:

```yaml
# In API Gateway service configuration
spec:
  template:
    spec:
      serviceAccountName: api-gateway-sa@project.iam.gserviceaccount.com
```

## Monitoring and Logging

All services are configured to use Cloud Logging and Monitoring:

```yaml
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/logging: "true"
```

## Scaling Configuration

Each service has custom scaling parameters:

```yaml
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
```

## Deployment Scripts

Automated deployment scripts will be added to this directory as the project progresses toward production readiness.

## Future Enhancements

- CI/CD pipeline integration with GitHub Actions
- Multi-region deployment configuration
- Traffic splitting for blue/green deployments
- Custom domain configuration
- VPC connector setup for private networking