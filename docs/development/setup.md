# LifePilot Mobile — Development & Android Studio Setup Guide

## 1. Prerequisites

Before running the LifePilot mobile project, ensure you have:

1. **Node.js**: LTS version (v20+ or v24+). Download from [nodejs.org](https://nodejs.org).
2. **npm**: Version 10 or 11 (bundled with Node.js).
3. **Android Studio**: Android Studio Ladybug / Meerkat or later. Download from [developer.android.com/studio](https://developer.android.com/studio).
4. **Android SDK**: Android API 34+ (Android 14/15) installed via Android Studio **SDK Manager** (`Settings > Languages & Frameworks > Android SDK`).
5. **Android Emulator**: At least one configured AVD (e.g. `Medium Phone API 37` or `Pixel 8 API 35`) created via Android Studio **Device Manager**.

---

## 2. Opening the Project in Android Studio

1. Launch **Android Studio**.
2. Select **File > Open…** (or **Open** from the welcome dialog).
3. Navigate to and select the `lifepilot-mobile` root directory (the folder containing `package.json`).
4. Click **OK**.
5. Android Studio will open the project workspace and preserve the `.idea` configuration.

> **Note:** `node_modules` is excluded from IDE indexing to prevent file-locking issues during package installations. If Android Studio prompts you to index the folder, choose to exclude it.

---

## 3. Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Verify the configuration variables in `.env.local`:
   - `EXPO_PUBLIC_API_URL`: Points to `http://10.0.2.2:8000/api/v1` for the local Android Emulator loopback address. Change this to point at your backend server.
   - `EXPO_PUBLIC_DB_NAME`: Defaults to `lifepilot.db`.

---

## 4. Installing Dependencies

Open the **Terminal** tab within Android Studio (`Alt + F12` on Windows / Linux, `⌥ F12` on macOS) and run:

```bash
npm install
```

> **Note:** On Windows, the PowerShell execution policy may require using `npm.cmd` instead of `npm`. Both commands are equivalent.

---

## 5. Running on Android Emulator

### Step 1: Launch the Android Emulator

Start your AVD from Android Studio **Device Manager** (the phone icon in the right toolbar), or launch it from the command line:

**macOS / Linux:**
```bash
$ANDROID_HOME/emulator/emulator -avd <YourAVDName>
```

**Windows (PowerShell):**
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd <YourAVDName>
```

Replace `<YourAVDName>` with the name of your AVD as shown in Device Manager (e.g. `Medium_Phone_API_37`).

### Step 2: Start the Expo Development Server

```bash
npm run android
```

Metro will compile the TypeScript bundle and install the LifePilot application on the connected Android emulator automatically.

---

## 6. Verification Commands

Run the following quality and test verification commands from the integrated terminal:

```bash
# Strict TypeScript type checking
npm run typecheck

# Lint with ESLint (flat config)
npm run lint

# Check code formatting with Prettier
npm run format:check

# Auto-format all files
npm run format

# Run Jest unit test suite
npm test

# Run Jest in CI mode with coverage report
npm run test:ci
```

---

## 7. Database Migrations

The SQLite database schema is managed by a transactional migration runner (`src/database/migrationRunner.ts`). Migrations are applied automatically on app startup.

**Migration conventions:**
- Migrations are stored in `src/database/migrations/` and registered in `src/database/migrations/index.ts`.
- Each migration runs inside a `BEGIN TRANSACTION … COMMIT` block. On failure, `ROLLBACK` is issued automatically.
- Applied migrations are recorded in the `schema_migrations` table and are never re-run.
- **Historical migrations are immutable.** Never modify a migration that has been released to users. Create a new numbered migration instead.

**Monetary storage convention:**
- All financial amounts are stored as **integer minor units** (e.g., 1,250.50 KES → `125050`).
- The default currency is **KES**.
- Migration 002 upgrades the initial `amount REAL` schema to `amount_minor INTEGER` safely, preserving all existing records and converting amounts using `ROUND(amount * 100)` to avoid floating-point truncation.

---

## 8. Common Troubleshooting

### Android Emulator not detected by adb

Verify adb status:

```bash
adb devices
```

If the list is empty, restart the adb server:

```bash
adb kill-server
adb start-server
```

### Metro Bundler port conflict (Port 8081 already in use)

Run Expo on an alternate port:

```bash
npx expo start --port 8082 --android
```

### Clearing Metro Cache

```bash
npx expo start -c
```

### npm ci fails with peer dependency conflicts

This project uses `jest-expo@58` which has a peer dependency on Jest 29. Use `--legacy-peer-deps` for local development installs if needed:

```bash
npm install --legacy-peer-deps
```

The CI pipeline uses `npm ci` with the committed `package-lock.json`.
