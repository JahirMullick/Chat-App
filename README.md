# TestChat - Telegram Clone 🚀

A modern messaging application built with [Expo](https://expo.dev) and React Native, featuring real-time chat, notifications, and media sharing capabilities.

## Overview

TestChat is a full-featured messaging platform that demonstrates advanced React Native development patterns including Firebase integration, push notifications, and real-time database synchronization.

## App URL

- **Production**: Currently in development Phase
- **Staging**: Currently in development Phase
- **Development**: [View App](https://drive.google.com/drive/folders/1QjzarMbF2vxnxnFJ2Z_2TICj9a64aiFH?usp=drive_link)

## Features

- 💬 Real-time messaging
- 🔔 Push notifications (FCM)
- 👥 Group chat support
- 🎥 Media sharing
- ✍️ Typing indicators
- 🎭 Message reactions
- 📱 Cross-platform (iOS & Android)
- 🔐 Secure authentication

## Prerequisites

- Node.js 16+ and npm
- Expo CLI
- Firebase account
- Android Studio (for Android development)
- Xcode (for iOS development)

## Installation

1. Clone the repository

   ```bash
   git clone <your-repo-url>
   cd testchat
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Configure Firebase

   - Add your `google-services.json` (Android)
   - Add your `GoogleService-Info.plist` (iOS)

## Running the App

Start the development server:

```bash
npx expo start
```

### Development Options

- **Android Emulator**: Press `a` in the terminal
- **iOS Simulator**: Press `i` in the terminal
- **Expo Go**: Scan the QR code with the Expo Go app
- **Development Build**: Run on a physical device

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # App screens
├── navigation/       # Navigation configuration
├── services/         # API and Firebase services
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── constants/        # App constants and colors
```

## Available Scripts

```bash
# Start development
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Build for production
npm run build
```

## Documentation

- [Firebase Setup](./FCM_SETUP_GUIDE.md)
- [Notification Architecture](./NOTIFICATION_ARCHITECTURE.md)
- [Color System](./COLOR_CENTRALIZATION_SUMMARY.md)

## Contributing

Contributions are welcome! Please ensure your code follows the project's style guidelines.

## Support

For issues and questions, please create an issue in the repository.

## License

MIT License - See LICENSE file for details

