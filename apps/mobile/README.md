# NeatSpend Mobile Application

A cross-platform mobile application for the NeatSpend personal finance tracker built with React Native.

## ✨ Features (Planned)

- 📱 Native iOS and Android experience
- 💰 On-the-go transaction management
- 📊 Financial dashboard and visualizations
- 🔔 Push notifications for transactions
- 📷 Receipt scanning and processing
- 🔒 Biometric authentication
- 📴 Offline functionality
- 🌙 Dark/light mode support

## 🚀 Tech Stack

- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit / Context API
- **UI Components**: React Native Paper
- **Charts**: Victory Native / React Native SVG Charts
- **API Integration**: Axios / React Query
- **Storage**: AsyncStorage / Realm
- **Testing**: Jest / React Native Testing Library

## 🏗️ Project Structure

```
mobile/
├── src/
│   ├── screens/            # Application screens
│   ├── components/         # React Native components
│   ├── navigation/         # Navigation configuration
│   ├── redux/              # State management
│   ├── services/           # API services
│   ├── hooks/              # Custom hooks
│   ├── utils/              # Utility functions
│   ├── constants/          # App constants
│   └── assets/             # Images and assets
├── android/                # Android-specific code
├── ios/                    # iOS-specific code
├── __tests__/              # Test files
├── app.json                # App configuration
├── babel.config.js         # Babel configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🚀 Development Status

This application is currently in early development. The following components are planned:

- [ ] Project setup with React Native
- [ ] Navigation structure
- [ ] Authentication flows
- [ ] Dashboard and transaction screens
- [ ] Push notification setup
- [ ] Offline data synchronization
- [ ] Biometric authentication
- [ ] Receipt scanning functionality
- [ ] Comprehensive test suite

## 🔄 Integration Points

The mobile application will integrate with:

- **API Gateway**: For all backend communication
- **User Service**: For authentication and user management
- **Transaction Service**: For financial data
- **SMS Sync Worker**: For SMS transaction detection
- **AI Insight Service**: For financial insights

## 🧪 Testing Strategy

- **Unit Tests**: For individual components and hooks
- **Integration Tests**: For screen functionality
- **E2E Tests**: For critical user flows
- **Device Testing**: For cross-device compatibility

## 📝 Development Roadmap

1. **Phase 1**: Authentication and basic dashboard
2. **Phase 2**: Transaction management and notifications
3. **Phase 3**: Offline functionality and sync
4. **Phase 4**: Advanced features (receipt scanning, insights)

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test
```

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API level 21+ (Android 5.0+)

---

**Part of the NeatSpend ecosystem** 🚀