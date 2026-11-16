# LifePilot Mobile

> **Your Personal Daily Operating System**  
> Modern, offline-first personal productivity and financial management application built with React Native, Expo, and TypeScript.

---

## 1. Project Overview

**LifePilot** empowers individuals to orchestrate their daily lives, align habits with long-term goals, and maintain rigorous financial clarity. It is designed **Android-first** with an **offline-first local database architecture**, ensuring full capability even without internet connectivity.

- **Platform Target**: Android (First-class), iOS, Web
- **Primary IDE**: Android Studio
- **Architecture**: Feature-based modular architecture with offline-first synchronization
- **Local Persistence**: Expo SQLite (WAL mode, automated migrations, outbox pattern)
- **State Architecture**: Zustand (Client UI State) & TanStack Query (Server State Cache)
- **Security**: Hardware-backed credential encryption via Expo SecureStore

---

## 2. Technology Stack

| Layer            | Technology          | Version  | Purpose                                         |
| :--------------- | :------------------ | :------- | :---------------------------------------------- |
| **Framework**    | React Native        | 0.88.1   | Native mobile cross-platform runtime            |
| **Tooling**      | Expo SDK            | ~58.0.25 | Managed developer workflow & native modules     |
| **Language**     | TypeScript          | ~6.0.3   | Strict static typing and contract validation    |
| **Navigation**   | Expo Router         | ~58.0.31 | File-based type-safe navigation & deep linking  |
| **Database**     | Expo SQLite         | ~58.0.17 | Local offline persistence with WAL mode         |
| **Client State** | Zustand             | ^5.0.3   | Synchronous UI & session state                  |
| **Server Cache** | TanStack Query      | ^5.67.1  | Asynchronous server caching & invalidation      |
| **HTTP Client**  | Axios               | ^1.8.1   | Centralized REST client with token interceptors |
| **Validation**   | Zod                 | ^3.24.2  | Runtime schema validation for forms & APIs      |
| **Forms**        | React Hook Form     | ^7.54.2  | Performant, uncontrolled form state             |
| **Security**     | Expo SecureStore    | ~58.0.3  | Keychain/KeyStore encrypted credential vault    |
| **Icons**        | Lucide React Native | ^1.73.0  | Modern SVG iconography                          |
| **Unit Testing** | Jest & Expo Jest    | ^29.7.0  | Test runner and mocking harness                 |

---

## 3. Project Structure

```
lifepilot-mobile/
├── app/                              # Expo Router file-based navigation
│   ├── _layout.tsx                   # Root application layout (Providers, DB init)
│   ├── index.tsx                     # Entry redirect to main tabs
│   ├── (auth)/                       # Authentication route group
│   │   ├── _layout.tsx               # Auth Stack navigator
│   │   ├── login.tsx                 # Login screen with validation
│   │   └── register.tsx              # Account registration screen
│   └── (tabs)/                       # Main application bottom navigation
│       ├── _layout.tsx               # 5-tab bar configuration
│       ├── index.tsx                 # [1] Home / Dashboard Shell
│       ├── planner.tsx               # [2] Planner (Tasks & Habits)
│       ├── finance.tsx               # [3] Finance (Cashflow & Envelopes)
│       ├── insights.tsx              # [4] Insights (Analytics & Trends)
│       └── profile.tsx               # [5] Profile (Settings, Theme, DB status)
├── src/
│   ├── components/
│   │   ├── common/                   # Text, Button, Card, Badge, LoadingState, etc.
│   │   ├── forms/                    # FormInput, FormButton
│   │   └── layout/                   # ScreenLayout, Header, Section
│   ├── constants/
│   │   ├── config.ts                 # Environment & feature flag constants
│   │   └── layout.ts                 # Dimensions, grid metrics, tab bar height
│   ├── database/
│   │   ├── migrations/               # Database migrations (001_initial_schema.ts)
│   │   ├── repositories/             # SyncOutboxRepository
│   │   ├── migrationRunner.ts        # Transactional migration executor
│   │   └── sqlite.ts                 # SQLite singleton & transaction helpers
│   ├── hooks/
│   │   ├── useAppInit.ts             # App initialization & splash screen coordination
│   │   ├── useDatabase.ts            # Reactive database readiness hook
│   │   └── useTheme.ts               # Theme tokens & active mode hook
│   ├── schemas/                      # Zod validation schemas (auth, finance, tasks)
│   ├── services/
│   │   ├── api/                      # Axios client, error handling, endpoints, types
│   │   └── storage/                  # SecureStore credential abstraction
│   ├── stores/                       # Zustand stores (authStore, themeStore, syncStore)
│   ├── theme/                        # Design tokens (colors, typography, spacing, etc.)
│   ├── types/                        # TypeScript domain interfaces
│   └── utils/                        # Logging, UUID generation, formatters
├── assets/                           # Adaptive icons, splash screens, favicon
├── docs/                             # Architecture & setup documentation
│   ├── architecture/
│   │   ├── overview.md
│   │   └── decisions.md
│   └── development/
│       └── setup.md
├── tests/                            # Jest unit & component test suite
├── .env.example                      # Template for client environment variables
├── app.config.ts                     # Dynamic Expo project configuration
├── package.json                      # Project manifest & npm scripts
├── tsconfig.json                     # Strict TypeScript configuration
└── README.md
```

---

## 4. Getting Started

### Prerequisites

- **Node.js**: v20+ or v24+
- **Android Studio**: Ladybug / Meerkat or later with Android SDK 34+
- **Android Emulator**: An active AVD (e.g., Medium Phone API 37)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/harrisonmuhoro/lifepilot-mobile.git
   cd lifepilot-mobile
   ```

2. Install dependencies:

   ```bash
   npm.cmd install
   ```

3. Create local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

---

## 5. Development & Running on Android

To run the application on your Android emulator:

```bash
# Start Android emulator build via Expo
npm.cmd run android
```

Or open the project inside **Android Studio**, launch the emulator from the **Device Manager**, open the integrated terminal (`Alt + F12`), and run:

```bash
npm.cmd run android
```

---

## 6. Quality & Verification Commands

All quality gates are configured and tested:

```bash
# Strict TypeScript Type Checking
npm.cmd run typecheck

# Code Linting (ESLint 9 Flat Config with Expo rules)
npm.cmd run lint

# Code Formatting Verification (Prettier)
npm.cmd run format:check

# Automated Prettier Formatting
npm.cmd run format

# Jest Unit Test Suite
npm.cmd test
```

---

## 7. Architecture Highlights

1. **Offline-First Persistence**: Local SQLite database with Write-Ahead Logging (WAL) and automated schema migration runner (`src/database/migrationRunner.ts`).
2. **Sync Outbox Pattern**: Future-ready transaction and task mutations are queued in `sync_outbox` with UUID idempotency keys.
3. **Design System**: Strict design tokens with Navy/Slate visual foundation and dynamic Light/Dark mode support.
4. **Secure Credential Vault**: Token storage abstracted via `expo-secure-store` to ensure security on Android devices.
5. **Typed REST Contracts**: Centralized Axios client configured with request/response interceptors and Laravel 422 error parsing.

---

## 8. Development Roadmap

- [x] **Phase 1: Foundation (Current)**
  - Project scaffolding with Expo SDK 58 & React Native 0.88.
  - Strict TypeScript configuration.
  - 5-tab Expo Router navigation (Home, Planner, Finance, Insights, Profile).
  - Design system tokens (colors, typography, spacing, elevation) and reusable UI components.
  - SQLite singleton, transaction helper, and transactional migration runner.
  - Secure credential storage abstraction and Axios API client.
  - Complete Jest unit testing suite and linting/formatting pipelines.
- [ ] **Phase 2: Local Planner & Task Engine**
  - Task CRUD operations with SQLite repository.
  - Priority management and recurring habit tracking engine.
- [ ] **Phase 3: Financial Engine**
  - Income/expense logging, budget envelopes, and balance calculation.
- [ ] **Phase 4: Synchronization Engine**
  - Background outbox sync worker and conflict resolution with Laravel REST API.
- [ ] **Phase 5: Insights & Analytics Telemetry**
  - Trend charts, habit streaks, and weekly review telemetry.
