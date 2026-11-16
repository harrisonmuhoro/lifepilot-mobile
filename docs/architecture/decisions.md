# Architecture Decision Records (ADRs)

## ADR-001: Mobile Platform & Runtime

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: LifePilot requires a cross-platform mobile architecture with first-class Android emulator performance and rapid developer iteration in Android Studio.
- **Decision**: Adopt React Native 0.88 with Expo SDK 58 and Expo Router.
- **Consequences**: Fast reload, native Android performance, unified TypeScript contracts, managed native dependencies, and future-proof upgrade paths without manual Gradle/CMake overhead for standard features.

---

## ADR-002: Offline-First Persistence & Synchronization Model

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: Financial transactions and daily productivity tasks must be recorded instantly even when offline (e.g. in transit, airplane mode, or poor signal).
- **Decision**:
  1. Use `expo-sqlite` as the local single source of truth on the client.
  2. Implement an Outbox synchronization pattern (`sync_outbox`) for write operations.
  3. Generate client-side RFC4122 v4 UUIDs for all entities so local records exist independently of backend auto-increment IDs.
  4. Use cursor-based incremental synchronization (`sync_cursor`) for downstream pull queries.
- **Consequences**: Zero UI latency when saving data offline, guaranteed idempotency on backend replay, and isolation of network failures from the user experience.

---

## ADR-003: Database Transactions and Migration Versioning

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: Financial records and sync queues require strict ACID compliance and safe schema evolution across app updates.
- **Decision**:
  1. Enforce SQLite Write-Ahead Logging (WAL) and Foreign Keys on every connection.
  2. Run all schema migrations inside explicit `BEGIN TRANSACTION; ... COMMIT;` blocks with automated `ROLLBACK;` upon error.
  3. Track applied migrations via a dedicated `schema_migrations` table.
- **Consequences**: Complete protection against partial database updates or corrupted schemas during app upgrades.

---

## ADR-004: Credential Security & Token Storage

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: JWT authentication tokens must never be stored in plaintext storage like `AsyncStorage` or localStorage.
- **Decision**: Encapsulate all token storage within `Expo SecureStore`, utilizing hardware-backed Android KeyStore / Keystore accessible after first unlock.
- **Consequences**: Protection against unauthorized extraction of user sessions, compliant with mobile security best practices.

---

## ADR-005: State Management Separation of Concerns

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: Avoiding oversized state stores and separating client state from server cache.
- **Decision**:
  1. **Zustand**: Lightweight stores for synchronous client-only state (`themeStore`, `authStore`, `syncStore`).
  2. **TanStack Query (React Query)**: Asynchronous cache, background refetching, and query invalidation.
- **Consequences**: Clean separation of transient UI state from cached network data, eliminating Redux boilerplate.

---

## ADR-006: Strict TypeScript & Zero Implicit Any

- **Date**: 2026-11-16
- **Status**: Accepted
- **Context**: Financial calculation and offline synchronization errors must be caught at compile time.
- **Decision**: Enable strict mode in `tsconfig.json` (`noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, `noUnusedLocals`).
- **Consequences**: Complete type safety across all components, hooks, repositories, and API clients.
