# LifePilot Mobile — Architecture Overview

## 1. System Vision & Purpose

**LifePilot** ("Your Personal Daily Operating System") is an Android-first mobile application providing integrated personal productivity, financial cashflow tracking, goal execution, and predictive habit insights.

The mobile client is architected for **offline-first reliability**. Users can schedule tasks, record transactions, and plan their day without an active internet connection. When connectivity is established, local changes synchronize idempotently with a central Laravel REST API backed by a MySQL database.

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       LifePilot App                         │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         UI Layer: Expo Router & React Native          │  │
│  │   (Tabs: Home, Planner, Finance, Insights, Profile)   │  │
│  │   (Reusable Theme Tokens, Design System, Common UI)   │  │
│  └───────────────▲───────────────────────▲───────────────┘  │
│                  │                       │                  │
│  ┌───────────────▼───────────┐  ┌────────▼───────────────┐  │
│  │    Client State (Zustand) │  │ Server Cache (TanStack)│  │
│  │   Auth, Theme, SyncState  │  │   Queries & Mutations  │  │
│  └───────────────▲───────────┘  └────────▲───────────────┘  │
│                  │                       │                  │
│  ┌───────────────▼───────────────────────▼───────────────┐  │
│  │             Services & Data Management Layer          │  │
│  │  ┌───────────────────────┐ ┌────────────────────────┐ │  │
│  │  │ Expo SQLite (WAL Mode)│ │ Axios API Client       │ │  │
│  │  │ Migrations & Outbox   │ │ Bearer Auth & Errors   │ │  │
│  │  └───────────▲───────────┘ └───────────▲────────────┘ │  │
│  │              │                         │              │  │
│  │  ┌───────────▼───────────┐ ┌───────────▼────────────┐ │  │
│  │  │ Expo SecureStore      │ │ Expo Notifications     │ │  │
│  │  │ Token Storage         │ │ Background Reminders   │ │  │
│  │  └───────────────────────┘ └────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────▲──────────────────────────────┘
                               │ (Sync Push & Pull)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Future Central Backend                      │
│             Laravel REST API + MySQL Database               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architectural Layers

### 3.1 Presentation & Navigation (Expo Router)

- **File-based routing**: Under `app/`, providing strict type-safe navigation.
- **Root Layout (`app/_layout.tsx`)**: Controls splash screen lifecycle, database initialization, auth restoration, and TanStack `QueryClientProvider`.
- **Bottom Navigation (`app/(tabs)/_layout.tsx`)**: 5 primary destinations:
  1. **Home**: High-level dashboard shell, today's focus, financial snapshot, and architecture health telemetry.
  2. **Planner**: Daily priorities, task scheduling, habit execution.
  3. **Finance**: Net balance, cashflow (income/expense), budget envelopes.
  4. **Insights**: Habit streaks, telemetry, productivity analytics.
  5. **Profile**: Account management, light/dark/system theme selection, database diagnostics.

### 3.2 Design System & Theming

- Strict token-driven theming (`src/theme/`):
  - **Colors**: Deep navy/slate palette (`#090D16` / `#0F172A`), primary blue accent (`#2563EB` / `#3B82F6`), semantic green for positive finance, amber for warnings, red for debt/destructive actions.
  - **Typography**: Inter/system typography with proportional font sizes and line heights.
  - **Spacing & Radii**: Consistent 4px grid and rounded corners.
  - **Elevation**: Multi-layered shadow and elevation tokens.
- Light and Dark modes supported dynamically via `useTheme` and `useThemeStore`.

### 3.3 Persistence & Offline-First Foundation

- **Local Engine**: `expo-sqlite` configured with Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and Foreign Key enforcement (`PRAGMA foreign_keys = ON;`).
- **Migration Engine**: `src/database/migrationRunner.ts` applies migrations sequentially inside atomic database transactions and records version history in `schema_migrations`.
- **Outbox Pattern**: `sync_outbox` table enqueues local modifications with UUID idempotency keys, entity types, JSON payloads, and timestamps.
- **Cursor Tracking**: `sync_cursor` maintains high-water marks for incremental server pull operations.

### 3.4 API & Security Foundation

- **Axios HTTP Client**: Centralized in `src/services/api/apiClient.ts` with request/response interceptors.
- **Token Vault**: `src/services/storage/secureStorage.ts` abstracts `expo-secure-store` to keep access tokens, refresh tokens, and user credentials off unencrypted storage.
- **Error Normalization**: `src/services/api/apiErrors.ts` transforms HTTP statuses and Laravel 422 validation bags into typed `ApiError` instances.
- **Runtime Validation**: Zod schemas (`src/schemas/`) enforce contract verification before database insertion or API transmission.
