# SMS Sync Worker

A microservice for extracting and processing financial transactions from SMS notifications in the NeatSpend application.

## ✨ Features (Planned)

- 📱 SMS message parsing and extraction
- 💳 Transaction data extraction from bank notifications
- 🏷️ Automatic transaction categorization
- 🔄 Real-time processing pipeline
- 🏦 Multi-bank support with custom parsers
- 📊 Transaction enrichment with metadata
- 🔐 Secure handling of financial data

## 🚀 Tech Stack

- **Runtime**: Node.js 20.x
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Message Processing**: Custom regex parsers
- **Queue**: Bull/Redis for job processing
- **Containerization**: Docker with Alpine Linux

## 🏗️ Project Structure

```
sms-sync-worker/
├── src/
│   ├── parsers/             # Bank-specific SMS parsers
│   ├── processors/          # Transaction processors
│   ├── models/              # Data models
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration
│   └── index.js             # Entry point
├── tests/                   # Test files
├── Dockerfile              # Docker configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🚀 Development Status

This service is currently in early development. The following components are planned:

- [ ] Basic service structure and configuration
- [ ] SMS parsing engine with regex patterns
- [ ] Bank notification templates
- [ ] Transaction extraction logic
- [ ] Categorization algorithm
- [ ] API endpoints for SMS submission
- [ ] Integration with transaction storage
- [ ] Comprehensive test suite

## 🔄 Integration Points

The SMS Sync Worker will integrate with:

- **User Service**: For user preferences and settings
- **Transaction Service**: For storing extracted transactions
- **AI Insight Service**: For transaction categorization assistance

## 📊 Planned API Endpoints

```
POST /api/sms/process          # Process new SMS message
GET /api/sms/banks             # List supported banks
GET /api/sms/status            # Check processing status
POST /api/sms/test             # Test SMS parsing
```

## 🧪 Testing Strategy

- **Unit Tests**: For individual parsers and extractors
- **Integration Tests**: For end-to-end SMS processing
- **Mock Tests**: With sample SMS messages from various banks
- **Performance Tests**: For processing throughput

## 📝 Development Roadmap

1. **Phase 1**: Basic SMS parsing for major banks
2. **Phase 2**: Transaction extraction and categorization
3. **Phase 3**: Advanced parsing with machine learning assistance
4. **Phase 4**: Real-time processing and integration

## 🏦 Supported Banks (Planned)

- [ ] Bank of America
- [ ] Chase
- [ ] Wells Fargo
- [ ] Citibank
- [ ] Capital One
- [ ] HSBC
- [ ] TD Bank
- [ ] PNC Bank

---

**Part of the NeatSpend microservices ecosystem** 🚀