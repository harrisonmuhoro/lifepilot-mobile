# LifePilot Mobile — Development & Android Studio Setup Guide

## 1. Prerequisites

Before running the LifePilot mobile project, ensure you have:

1. **Node.js**: LTS version (v20+ or v24+).
2. **npm**: Version 10 or 11.
3. **Android Studio**: Android Studio Ladybug / Meerkat or later.
4. **Android SDK**: Android API 34+ (Android 14/15) installed via SDK Manager.
5. **Android Emulator**: At least one configured AVD (e.g. `Medium Phone API 37` or `Pixel 8 API 35`).

---

## 2. Opening the Project in Android Studio

1. Launch **Android Studio**.
2. Select **File > Open...** (or **Open** from the welcome dialog).
3. Navigate to and select the directory:
   ```
   C:\Users\BLADE\StudioProjects\lifepilot-mobile
   ```
4. Click **OK**.
5. Android Studio will open the project workspace and preserve the `.idea` configuration. Note that `node_modules` is excluded from IDE indexing to prevent file locking issues during package installations.

---

## 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Verify the configuration variables:
   - `EXPO_PUBLIC_API_URL`: Points to `http://10.0.2.2:8000/api/v1` for local Android Emulator loopback.
   - `EXPO_PUBLIC_DB_NAME`: Defaults to `lifepilot.db`.

---

## 4. Running the Development Server & Android Emulator

Open the **Terminal** tab within Android Studio (`Alt + F12` on Windows).

### Step 1: Install Dependencies (if not already installed)

```bash
npm.cmd install
```

### Step 2: Launch Android Emulator

Ensure your AVD is running:

- Either start it from Android Studio **Device Manager**
- Or launch it via command line:
  ```powershell
  cmd.exe /c "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd Medium_Phone_API_37.0"
  ```

### Step 3: Start the Expo Development Server

```bash
npm.cmd run android
```

Metro will compile the TypeScript bundle and launch the LifePilot application on the connected Android emulator.

---

## 5. Verification Commands

Run the quality and test verification commands from the integrated terminal:

```bash
# Type check with strict TypeScript
npm.cmd run typecheck

# Lint with ESLint
npm.cmd run lint

# Check code formatting with Prettier
npm.cmd run format:check

# Run Jest unit test suite
npm.cmd test
```

---

## 6. Common Troubleshooting

### Issue: Android Emulator not detected by adb

**Fix**: Verify adb status:

```bash
adb devices
```

If empty, restart the adb server:

```bash
adb kill-server
adb start-server
```

### Issue: Metro Bundler port conflict (Port 8081 busy)

**Fix**: Run Expo on an alternate port:

```bash
npx.cmd -y expo start --port 8082 --android
```

### Issue: Clearing Metro Cache

**Fix**:

```bash
npx.cmd -y expo start -c
```
