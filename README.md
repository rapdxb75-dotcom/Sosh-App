# Sosh-App 📱

Welcome to the **Sosh-App** repository! Sosh is a feature-rich React Native application built with the Expo framework, integrating AI capabilities for social media automation and content creation.

## 🚀 Tech Stack

- **Framework**: [Expo](https://expo.dev) & React Native
- **Navigation**: Expo Router (File-based routing)
- **Styling**: NativeWind (TailwindCSS)
- **State Management**: Redux Toolkit
- **Backend & Auth**: Firebase (Firestore, Auth, Cloud Messaging)
- **In-App Purchases**: `react-native-iap`
- **AI Integrations**: Anthropic (Claude) & Poppy AI APIs

## 📁 Project Structure

Understanding the codebase layout is key to navigating the project effectively:

```
Sosh-App/
├── app/                  # Expo Router navigation (tabs, auth screens, onboarding)
├── components/           # Reusable UI components grouped by feature domain
│   ├── ai/               # AI interaction components
│   ├── createPost/       # Post creation flow UI
│   ├── iap/              # Subscription & paywall components
│   └── ...
├── docs/                 # Detailed documentation 
│   ├── GETTING_STARTED.md # Setup & Deployment Guide
│   ├── Architecture.md    # High-level architecture & systems overview
│   └── push-notifications.md
├── hooks/                # Custom React hooks (e.g., useIAP, usePlanStatus)
├── services/             # External service integrations (Firebase, APIs, Speech)
├── store/                # Redux store configuration and slices
└── assets/               # Local images, fonts, and icons
```

## 📚 Documentation

Detailed guides are available in the `docs/` directory:

- **[Local Dev & Deployment Guide](./docs/GETTING_STARTED.md)**: Start here! Covers prerequisite installations, local development, environment variables, EAS building, and App Store submissions.
- **[Application Architecture](./docs/Architecture.md)**: Deep dive into how State Management, Authentication, Subscriptions, and AI Services are implemented.
- **[Push Notifications](./docs/push-notifications.md)**: Information regarding the FCM implementation.

## 🛠 Quick Start

If you already have your environment configured, follow these steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Setup environment variables:**
   Ensure you have a `.env` file containing the necessary `EXPO_PUBLIC_` keys (see `docs/GETTING_STARTED.md`).
3. **Run the development server:**
   ```bash
   npm start
   ```
   *Note: Standard Expo Go cannot run this app fully due to native modules like `react-native-iap`. Please run a development build (`npm run ios` or `npm run android`).*

## 🤝 Contributing

When contributing to this repository, please ensure you test your changes on both a physical device and a simulator to verify that native modules behave as expected. Keep Redux slices modular and respect the file-based routing architecture in `/app`.
