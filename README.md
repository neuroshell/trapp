# Trapp Tracker (Fitness Progress App)

This project is a cross-platform fitness tracker app built with **React Native + Expo**.

## 🚀 Getting Started (Required)

### 1) Install Node.js (LTS)
This project depends on Node.js and npm. Install them from:
- https://nodejs.org/en/download/

### 2) Install Expo CLI (optional)
You can use `npx` to run Expo without installing globally, but installing the CLI can be convenient:

```bash
npm install -g expo-cli
```

### 3) Install dependencies

```bash
cd trapp
npm install
```

### 4) Run the app locally

```bash
npm start
```

This will open the Expo Dev Tools where you can run on iOS, Android, or web.

---

## 🧩 Project Structure

- `App.tsx` — main entry point (contains the initial UI skeleton)
- `src/` — app code (screens, components, models, storage)
- `backend/` — optional Node.js sync server (Express + JSON store)

---

## 🧠 Next Steps

1. Run the app via `npm start` and confirm it loads.
2. Add workout logging UI in `src/screens/LogScreen.tsx`.
3. Build the persistence layer using AsyncStorage.
4. Add calendar view and achievements.

---

## ⚠️ Note

This repo contains starter code. You will need Node.js + npm installed to install dependencies and run the app.
