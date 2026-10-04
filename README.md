# EduManage — React Native app (multi-role)

Android app for the School Management backend (`shelfwatch_sfa_ir_backend`). Same design language as the EduManage web app — with **role-based themes**: student = violet, teacher = green, admin/principal = blue, coordinator = teal, driver = amber (see `src/theme.js` → `ROLE_THEMES`, applied at login via `applyRoleTheme`).

React Native **0.72.17** (works on Node **16.18.0**), zero navigation libraries. Native deps: `@react-native-async-storage/async-storage`, `react-native-image-picker` (fee-claim screenshots), `react-native-document-picker` (exam paper PDFs) — all autolinked; run `npm install` then rebuild the APK.

> ⚠️ Backend must be on **migration_v5.sql** (new roles, class subjects, exam papers, fee claims).

## Features (v2)

**Every role logs into the same app** — theme, tabs and screens adapt to `user_type`:

- **Student / parent** (violet): dashboard, homework, attendance, exams & results, report cards, remarks, notices, profile — plus **fee payment claims**: attach a payment screenshot to a pending fee (Fees → *Submit payment proof*); claim status (under review / rejected) shows on the fee card.
- **Teacher** (green): dashboard, my classes → students → student detail (add homework/remarks), one-tap attendance marking (P/A/L), exams → per-class subject papers, lesson plans (view + create), fee-claim review, notices.
- **Admin / Principal / Sub-admin / Coordinator** (blue/teal): school dashboard (stats + activity feed), classes & sections (create with **subjects**), add students, attendance, fees (records, mark paid, **approve/reject payment claims** with proof screenshot), exams (create for one class or **All classes** → per-class **subject-wise paper upload**), staff users (incl. coordinator/driver accounts), lesson plans, reception, transport, payments, bulk SMS, notices.
- **Driver** (amber): transport (vehicles & routes), notices, profile.

Pull-to-refresh everywhere; session persists across app restarts.

**Languages:** English + हिन्दी. Switcher on the Login screen and in Profile; choice persists. All UI strings live in `src/i18n.js` — to add a language, add a dictionary + one entry in `LANGS` there (missing keys fall back to English).

Backend endpoints live in `app/routers/student_portal.py` (`/student/*`) — all "me"-scoped, students can only see their own data.

## Project layout (adding features later)

```
src/
  config.js          # API base URL — the only thing to change per environment
  theme.js           # design tokens (mirrors web tailwind.config.js)
  api.js             # fetch wrapper + session storage
  hooks.js           # useApi(path) — loading/error/refresh in one line
  routes.js          # route registry + bottom tabs
  components/ui.jsx  # Card, Badge, StatCard, Row, Screen, Avatar…
  screens/           # one file per screen
```

New feature = new file in `screens/` + one entry in `routes.js` (+ optionally `More.jsx`'s list). New backend endpoint = add to `student_portal.py`.

## Prerequisites (once)

- Node 16.18.0 ✓
- JDK 17 (`brew install --cask zulu@17`) — RN 0.72's Gradle needs 11–17
- Android Studio → SDK Manager → install **Android SDK Platform 33** + **Build-Tools 33.0.0** + platform-tools
- Env vars (add to `~/.zshrc`):
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator
  ```

## Run (development)

```bash
# 1. backend running (see "Deploy backend" below, or locally:
#    cd ../shelfwatch_sfa_ir_backend && uvicorn app.main:app --reload --host 0.0.0.0)

# 2. point the app at the backend — edit src/config.js:
#    emulator:      http://10.0.2.2:8000
#    real device:   http://<your-laptop-LAN-IP>:8000   (phone on same Wi-Fi; get IP: ipconfig getifaddr en0)
#    server:        http://<server-ip>:8000

npm install
npm run android        # builds + installs on the running emulator / plugged-in device
# (in another terminal, if it doesn't start automatically): npm start
```

Real device via USB: enable Developer options → USB debugging, plug in, `adb devices` to confirm, then `npm run android`.

You need a **student** login. Create one first: web app → login as `subadmin` → Classes → create class/section → open section → Add student (username + password you choose) — then use that in the app.

## Build an APK

```bash
npm run apk            # = cd android && ./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release.apk` — copy to any Android phone and install ("install from unknown sources"). Works on any device/emulator, all common ABIs are bundled.

> Note: the release build is signed with the debug keystore (fine for testing/distribution to your own devices). For Play Store, generate a proper keystore and set it in `android/app/build.gradle` — see RN docs "Publishing to Google Play Store".

Before building a release APK, set `API_URL` in `src/config.js` to your **deployed server** address — release builds on a phone can't reach your laptop's localhost.

Also note: the app uses `http://` (not https) URLs. Android allows cleartext to any host in debug builds; for the release APK talking to a plain-IP server this is already handled via `android:usesCleartextTraffic="true"` in the manifest.

## Deploy backend (Docker — any server)

On any Linux server (or your own machine) with Docker installed:

```bash
cd shelfwatch_sfa_ir_backend
docker compose up -d --build
```

That starts MySQL 8 (schema + seed users auto-loaded on first boot) and the API on **port 8000**. Verify: `curl http://<server-ip>:8000/health` → `{"status":"ok"}`. Swagger: `http://<server-ip>:8000/docs`.

- Open port 8000 in the server's firewall/security group.
- Data persists in Docker volumes (`db_data`, `uploads_data`); `docker compose down` keeps data, `down -v` wipes it.
- Change `MYSQL_ROOT_PASSWORD` and `SECRET_KEY` in `docker-compose.yml` before real use.
- Logs: `docker compose logs -f api`.

### End-to-end test flow

1. Deploy backend (above). Point the **web app** at it too if you like: `VITE_API_URL=http://<server-ip>:8000 npm run dev` in `shelfwatch-plus`.
2. Web app as `subadmin`: create class + section + a student (set username/password).
3. Optionally add homework, mark attendance, add fees/exams/notices for that student.
4. Set `API_URL` in `src/config.js` to `http://<server-ip>:8000`, build the APK, install on a phone.
5. Log in as the student — dashboard, homework, attendance, fees, exams, notices all live from the same server.
