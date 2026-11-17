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
│   ├── index.tsx                     # Entry redirect to auth/tabs
│   ├── (auth)/                       # Authentication route group
│   │   ├── _layout.tsx               # Auth Stack navigator
│   │   ├── login.tsx                 # Login screen (Production API & Offline Demo Mode)
│   │   └── register.tsx              # Account registration screen
│   └── (tabs)/                       # Main application bottom navigation
│       ├── _layout.tsx               # 5-tab bar configuration
│       ├── index.tsx                 # [1] Home / Dashboard Shell
│       ├── planner.tsx               # [2] Planner (Tasks & Habits)
│       ├── finance.tsx               # [3] Finance (Cashflow & Envelopes)
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
│   │   ├── migrations/               # 001_initial_schema.ts, 002_convert_transaction_amounts_to_minor_units.ts
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

- **Node.js**: v20+ or v24+ (download from [nodejs.org](https://nodejs.org))
- **npm**: v10+ (bundled with Node.js)
- **Android Studio**: Ladybug / Meerkat or later with Android SDK 34+
- **Android Emulator**: An active AVD (e.g., Medium Phone API 37) created in Device Manager

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/harrisonmuhoro/lifepilot-mobile.git
   cd lifepilot-mobile
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create local environment configuration:
   ```bash
   cp .env.example .env.local
   ```

---

## 5. Development & Running on Android

To run the application on your Android emulator:

```bash
npm run android
```

Or open the project inside **Android Studio**, launch the emulator from the **Device Manager**, open the integrated terminal (`Alt + F12` on Windows), and run:

```bash
npm run android
```

> **Note:** On Windows, if the PowerShell execution policy blocks `npm`, use `npm.cmd` instead, or open a Command Prompt (`cmd`) terminal within Android Studio.

---

## 6. Quality Gates & Verification Commands

Automated quality gates are enforced via GitHub Actions CI (`.github/workflows/ci.yml`). The CI pipeline runs `npm ci`, TypeScript checking, ESLint, Prettier, and Jest on every push and pull request to `main`.

Run the same checks locally:

```bash
# Strict TypeScript type checking
npm run typecheck

# Code linting (ESLint 9 Flat Config with Expo rules)
npm run lint

# Formatting verification (Prettier)
npm run format:check

# Auto-format all files
npm run format

# Jest unit test suite (interactive)
npm test

# Jest CI mode with coverage report
npm run test:ci
```

---

## 7. Architecture Highlights

1. **Offline-First Persistence**: Local SQLite database with Write-Ahead Logging (WAL), Foreign Keys, and automated sequential migration runner (`src/database/migrationRunner.ts`).
2. **Safe Database Migrations**: Historical migrations are immutable. Breaking schema changes are applied via new numbered migrations. Each migration runs inside `BEGIN TRANSACTION … COMMIT`. Failed migrations roll back automatically.
3. **Integer Minor-Unit Financial Storage**: All monetary amounts are stored as integer minor units (e.g. KES 1,250.50 → `125050`). `toMinorUnits()` performs string-based conversion to avoid floating-point rounding errors. The default currency is KES.
4. **Sync Outbox Pattern (Foundation)**: Local mutations are queued in `sync_outbox`. Stale `in_progress` records (orphaned by crash, older than 5 minutes) are recovered automatically. The full background sync engine is planned for Phase 4 and is **not yet implemented**.
5. **Design System**: Strict design tokens with Navy/Slate visual foundation and dynamic Light/Dark mode support.
6. **Secure Credential Vault**: All tokens stored exclusively via `expo-secure-store` (Android KeyStore / iOS Keychain). Write failures throw explicitly — credentials are never silently dropped.
7. **Demo / Offline Mode**: Explicitly isolated. Demo mode does not make API requests to the production backend. It is for offline development preview only.
8. **Typed REST Contracts**: Centralized Axios client with request/response interceptors and Laravel 422 error normalization.

---

## 8. Development Roadmap

- [x] **Phase 1: Foundation**
  - Project scaffolding with Expo SDK 58 & React Native 0.88.
  - Strict TypeScript configuration.
  - 5-tab Expo Router navigation (Home, Planner, Finance, Insights, Profile).
  - Design system tokens and reusable UI components.
  - SQLite singleton, WAL mode, transactional migration runner.
  - Migration 001: Initial schema (tasks, transactions with `amount REAL`, sync outbox, sync cursor).
  - Migration 002: Backward-compatible upgrade — converts `amount REAL` to `amount_minor INTEGER` (KES default). Safe for fresh installs and existing installations.
  - Secure credential storage abstraction with explicit failure propagation.
  - Axios API client with error normalization.
  - Demo / offline mode (isolated from production backend).
  - Sync outbox foundation with stale-lease orphan recovery.
  - Jest test suite: migrations, finance validation, SecureStore failures, outbox retry behavior, UI components.
  - GitHub Actions CI pipeline.
- [ ] **Phase 2: Local Planner & Task Engine**
  - Task CRUD operations with SQLite repository.
- [ ] **Phase 3: Financial Engine**
  - Income/expense logging in integer minor units (KES default), budget envelopes, and balance calculation.
- [ ] **Phase 4: Synchronization Engine**
  - Background outbox sync worker and conflict resolution with Laravel REST API.
- [ ] **Phase 5: Insights & Analytics Telemetry**
  - Trend charts, habit streaks, and weekly review telemetry.
