# 🚀 Welcome to NeatSpend Development Environment!

Your Codespace is automatically setting up with all the services you need.

## 🎯 What's happening automatically:

✅ **Docker & Docker Compose** - Installed and ready  
✅ **All Dependencies** - npm packages installed  
✅ **Database Setup** - PostgreSQL with migrations  
✅ **Services Starting** - All microservices launching  
✅ **Port Forwarding** - Ready for testing  

## 🌐 Your Services:

- **API Gateway**: http://localhost:8080/health
- **User Service**: http://localhost:3001/health
- **Database**: PostgreSQL on port 5432

## 🛠️ Quick Commands:

```bash
# View service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Restart a specific service
docker-compose restart user-service

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

## 🧪 Testing:

```bash
# Run all tests
npm run test:all

# Run linting
npm run lint:all

# Test API Gateway
curl http://localhost:8080/health
```

---
**🎉 Your environment will be ready in ~2-3 minutes. Check the terminal for progress!**
