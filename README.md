# Hybrid Training App

A high-performance, offline-first mobile fitness application built with React Native and Expo.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](package.json)
![Build Status](https://github.com/adoniasketema/hybrid-training-app/workflows/CI/CD%20Pipeline/badge.svg)

## Installation

Ensure you have Node.js and npm installed, then run:

```bash
npm install
```

## Quick Start / Usage

Start the development server with Expo:

```bash
npx expo start
```

You can then open the app on an iOS simulator, Android emulator, or via the Expo Go app on your physical device.

## Features

- **Offline-First Architecture**: Built with `react-native-mmkv` to instantly cache workout data and user statistics, ensuring full functionality even in gym environments with poor connectivity.
- **Real-Time Synchronization**: Leverages Supabase WebSockets (`supabase.channel`) to provide live, reactive updates to the community workout feed without manual refreshes.
- **Enterprise-Grade QA Automation**: Features comprehensive end-to-end (E2E) testing flows using Maestro to validate core user journeys (e.g., authentication, logging a workout).
- **Automated CI/CD Pipeline**: Configured with GitHub Actions and Expo Application Services (EAS) to automatically lint, type-check, and deploy cloud builds on every push to the `main` branch.
- **Fluid UI/UX**: Implements smooth 60fps animations using `react-native-reanimated` and visually striking components (video backgrounds, dynamic stat rings).

## End-to-End Testing (Maestro)

This project includes automated UI testing. To run the tests locally:
1. Ensure your simulator is running the app.
2. Install the Maestro CLI.
3. Run the flows:
```bash
maestro test .maestro/login.yaml
maestro test .maestro/workout_flow.yaml
```

## Support

If you encounter any issues, please open an issue on the GitHub repository.
