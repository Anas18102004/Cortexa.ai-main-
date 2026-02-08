# Orbix Task Intelligence System - Deployment Guide

## Prerequisites

### Required Software
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker (optional, for containerized deployment)

### Required Accounts
- OpenAI API account with API key
- Cloud provider account (AWS/GCP/Azure) for production

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd orbix-task-intelligence
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql+asyncpg://orbix:password@localhost:5432/orbix_db

# Redis
REDIS_URL=redis://localhost:6379/0

# API
API_HOST=0.0.0.0
API_PORT=8000
```

### 5. Setup Database
```bash
# Start PostgreSQL (if using Docker)
docker run -d \
  --name orbix-postgres \
  -e POSTGRES_USER=orbix \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=orbix_db \
  -p 5432:5432 \
  postgres:15

# Create tables
python -c "from src.database import init_db; import asyncio; asyncio.run(init_db())"
```

### 6. Setup Redis
```bash
# Start Redis (if using Docker)
docker run -d \
  --name orbix-redis \
  -p 6379:6379 \
  redis:7
```

### 7. Run Example
```bash
python example.py
```

### 8. Start API Server
```bash
uvicorn src.api.main:app --reload --port 8000
```

Visit http://localhost:8000/docs for API documentation.

---

## Production Deployment

### Option 1: Docker Compose

#### 1. Build Images
```bash
docker-compose build
```

#### 2. Start Services
```bash
docker-compose up -d
```

#### 3. Run Migrations
```bash
docker-compose exec api python -c "from src.database import init_db; import asyncio; asyncio.run(init_db())"
```

### Option 2: Kubernetes

#### 1. Create Namespace
```bash
kubectl create namespace orbix
```

#### 2. Create Secrets
```bash
kubectl create secret generic orbix-secrets \
  --from-literal=openai-api-key=sk-... \
  --from-literal=database-url=postgresql+asyncpg://... \
  --from-literal=redis-url=redis://... \
  -n orbix
```

#### 3. Deploy
```bash
kubectl apply -f k8s/ -n orbix
```

### Option 3: Cloud Platform (AWS)

#### 1. Setup RDS (PostgreSQL)
```bash
aws rds create-db-instance \
  --db-instance-identifier orbix-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username orbix \
  --master-user-password <password> \
  --allocated-storage 20
```

#### 2. Setup ElastiCache (Redis)
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id orbix-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

#### 3. Deploy to ECS/Fargate
```bash
# Build and push image
docker build -t orbix-api .
docker tag orbix-api:latest <ecr-repo>/orbix-api:latest
docker push <ecr-repo>/orbix-api:latest

# Create ECS task definition and service
aws ecs create-service \
  --cluster orbix-cluster \
  --service-name orbix-api \
  --task-definition orbix-api:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

---

## Database Migrations

### Using Alembic

#### 1. Initialize Alembic
```bash
alembic init alembic
```

#### 2. Configure alembic.ini
```ini
sqlalchemy.url = postgresql+asyncpg://orbix:password@localhost:5432/orbix_db
```

#### 3. Create Migration
```bash
alembic revision --autogenerate -m "Initial schema"
```

#### 4. Apply Migration
```bash
alembic upgrade head
```

#### 5. Rollback (if needed)
```bash
alembic downgrade -1
```

---

## Monitoring & Observability

### 1. Prometheus Metrics
```bash
# Metrics endpoint
curl http://localhost:8000/metrics
```

### 2. Structured Logging
Configure logging in `.env`:
```env
LOG_LEVEL=INFO
LOG_FORMAT=json
```

### 3. Error Tracking (Sentry)
```env
SENTRY_DSN=https://...@sentry.io/...
```

### 4. APM (New Relic/DataDog)
```bash
pip install newrelic
newrelic-admin run-program uvicorn src.api.main:app
```

---

## Performance Tuning

### 1. Database Connection Pooling
```env
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### 2. Redis Caching
Enable caching for LLM responses:
```env
CACHE_ENABLED=true
CACHE_TTL=3600
```

### 3. Worker Processes
```bash
# Use multiple workers for production
uvicorn src.api.main:app --workers 4
```

### 4. Load Balancing
Use nginx or cloud load balancer:
```nginx
upstream orbix_api {
    server api1:8000;
    server api2:8000;
    server api3:8000;
}

server {
    listen 80;
    location / {
        proxy_pass http://orbix_api;
    }
}
```

---

## Security Checklist

- [ ] Enable HTTPS (TLS/SSL)
- [ ] Configure CORS properly
- [ ] Add API authentication (JWT)
- [ ] Rotate API keys regularly
- [ ] Enable database encryption at rest
- [ ] Use secrets management (AWS Secrets Manager, Vault)
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Set up intrusion detection
- [ ] Regular security scans

---

## Backup & Recovery

### Database Backups
```bash
# Daily backup
pg_dump -h localhost -U orbix orbix_db > backup_$(date +%Y%m%d).sql

# Restore
psql -h localhost -U orbix orbix_db < backup_20260202.sql
```

### Redis Backups
```bash
# Enable RDB snapshots
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

---

## Scaling Strategy

### Horizontal Scaling
- Deploy multiple API instances behind load balancer
- Use Redis for shared state
- Database read replicas for queries

### Vertical Scaling
- Increase instance sizes
- Optimize database queries
- Add caching layers

### Auto-Scaling (AWS)
```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name orbix-api-asg \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns <target-group-arn>
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Check credentials
psql -h localhost -U orbix -d orbix_db
```

#### 2. Redis Connection Errors
```bash
# Check Redis is running
redis-cli ping

# Check connection
redis-cli -h localhost -p 6379
```

#### 3. LLM Timeout Errors
- Increase timeout in `.env`: `LLM_TIMEOUT=30`
- Check OpenAI API status
- Verify API key is valid

#### 4. Performance Issues
- Check database query performance
- Enable query logging
- Add database indexes
- Increase worker count

---

## Health Checks

### API Health
```bash
curl http://localhost:8000/health
```

### Database Health
```bash
curl http://localhost:8000/health/db
```

### Redis Health
```bash
curl http://localhost:8000/health/redis
```

---

## Maintenance

### Regular Tasks
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly performance reviews
- [ ] Annual disaster recovery drills

### Monitoring Alerts
- API response time > 2s
- Error rate > 1%
- Database connections > 80%
- Redis memory > 90%
- Disk usage > 85%

---

## Support

For issues or questions:
- GitHub Issues: <repository-url>/issues
- Email: support@orbix.ai
- Slack: #orbix-support

---

**Deployment Checklist:**
- [ ] Environment variables configured
- [ ] Database setup complete
- [ ] Redis running
- [ ] Migrations applied
- [ ] API server running
- [ ] Health checks passing
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Security hardened
- [ ] Load testing completed
