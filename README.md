# 🚗 DriveTrack Pro v2.0 — Driving Institute Management System

A fully mobile-first Progressive Web App (PWA) with real-time sync, multi-admin login, auto schedule generation, instructor management, and attendance tracking.

---

## ✅ Features

| Feature | Details |
|---|---|
| 👮 Multi-Admin Login | 5 admins work simultaneously, PIN-based login |
| 📅 Auto Schedule | Generates slots: 4–8 AM, 10 AM–1 PM, 4–5:30 PM (30 min each) |
| 👤 Instructor Selection | Pick instructor when marking attendance |
| ⚡ Real-time Sync | All 5 admins see live changes instantly (Firebase) |
| 👥 Student Registry | Full student profiles with progress tracking |
| ✅ Attendance Marking | Search → Select Instructor → Log session |
| 📋 Records | Filter by date, instructor, remark |
| 📱 PWA | Install on Android/iPhone like a native app |
| 🌐 Web Dashboard | Use on desktop/laptop to check data |

---

## 🛠️ SETUP — Step by Step

### Step 1 — Install Node.js

1. Go to 👉 **https://nodejs.org**
2. Download the **LTS** version
3. Install it (Next → Next → Finish)
4. Verify in Terminal:
   ```
   node --version
   ```
   You should see `v18.x.x` or higher ✅

---

### Step 2 — Set Up Firebase (Free)

1. Go to 👉 **https://console.firebase.google.com**
2. Click **"Add project"** → Name it `drivetrack-pro` → Continue
3. Disable Google Analytics → Click **"Create project"**
4. Click **"Web" icon `</>`** → Register app name: `DriveTrack`
5. **Copy** the `firebaseConfig` block — you will need it next

**Enable Firestore:**
1. Left sidebar → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** → Next
3. Select region: **`asia-south1`** (best for India) → **Enable**

---

### Step 3 — Add Your Firebase Keys

1. Open the file: `src/firebase/config.js`
2. Replace each value with your actual Firebase config:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",        // ← paste your value
  authDomain:        "your-app.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123:web:abc"
};
```

Save the file ✅

---

### Step 4 — Install & Run

Open Terminal / Command Prompt inside the `drivetrack` folder:

```bash
# Install packages (first time only, takes ~2 minutes)
npm install

# Start the app
npm start
```

App opens at **http://localhost:3000** 🎉

**Default Login Credentials:**
| Username | PIN  | Role       |
|----------|------|------------|
| admin    | 1234 | Super Admin|
| inst1    | 1111 | Admin      |
| inst2    | 2222 | Admin      |
| inst3    | 3333 | Admin      |
| inst4    | 4444 | Admin      |

---

### Step 5 — Deploy Live (Free)

#### Option A: Drag & Drop on Vercel (Easiest — 5 minutes)

```bash
npm run build
```
This creates a `build/` folder.

1. Go to 👉 **https://vercel.com** → Sign up free
2. Click **"Add New Project"** → **"Upload"** tab
3. Drag and drop the **`build/`** folder
4. Click **Deploy** → Done! ✅

You get a URL like: `https://drivetrack-pro.vercel.app`

#### Option B: GitHub + Vercel (Best for updates)

```bash
git init
git add .
git commit -m "DriveTrack Pro v2"
git remote add origin https://github.com/YOUR_USERNAME/drivetrack-pro.git
git push -u origin main
```

Then go to vercel.com → Import from GitHub → Auto-deploys every push!

---

### Step 6 — Install as Mobile App (PWA)

**Android (Chrome):**
1. Open Chrome → go to your Vercel URL
2. Tap **⋮ menu** → **"Add to Home screen"**
3. Tap **Add** → App icon appears! 📱

**iPhone (Safari only):**
1. Open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap **Share button** (box with arrow) → **"Add to Home Screen"**
4. Tap **Add** → Done! 📱

---

## 📋 How the Schedule Works

When you tap **"⚡ Auto Generate"** on the Schedule page for a date, it creates 30-minute slots for ALL available instructors:

| Session | Time Slots |
|---|---|
| 🌅 Early Morning | 4:00, 4:30, 5:00, 5:30 AM |
| 🌄 Morning | 6:00, 6:30, 7:00, 7:30 AM |
| ☀️ Midday | 10:00, 10:30, 11:00, 11:30 AM, 12:00, 12:30 PM |
| 🌆 Evening | 4:00, 4:30, 5:00 PM |

Each slot can be:
- **Available** — not booked yet
- **Booked** — student assigned
- **Completed** — class done
- **Cancelled** — slot cancelled

You can edit any slot to assign/change a student, instructor, or status.

---

## 👥 How Multi-Admin Works

All 5 admins can log in at the same time from different phones. Firebase Firestore uses **real-time listeners** — when one admin adds attendance or updates a schedule, all other admins see it instantly with no page refresh needed. There is no lag or conflict.

---

## 📁 Project Structure

```
drivetrack/
├── public/
│   ├── index.html          — Main HTML
│   ├── manifest.json       — PWA config
│   └── sw.js               — Offline support
├── src/
│   ├── firebase/
│   │   ├── config.js       ← 🔑 PUT YOUR FIREBASE KEYS HERE
│   │   └── db.js           — All database functions
│   ├── context/
│   │   └── AuthContext.js  — Login state management
│   ├── components/
│   │   ├── UI.jsx          — Buttons, cards, modals, etc.
│   │   └── BottomNav.jsx   — Mobile bottom navigation
│   ├── pages/
│   │   ├── Login.jsx       — PIN login screen
│   │   ├── Dashboard.jsx   — Home stats & overview
│   │   ├── Schedule.jsx    — Auto-generate & manage slots
│   │   ├── Students.jsx    — Student registry
│   │   ├── Attend.jsx      — Mark attendance
│   │   └── Records.jsx     — View all records
│   ├── utils/helpers.js    — Date/time formatting
│   ├── App.jsx             — Main app with real-time sync
│   └── index.js            — Entry point
├── package.json
├── vercel.json             — Vercel routing config
├── firestore.rules         — Firebase security rules
└── README.md               — This file
```

---

## 🔧 Common Problems & Fixes

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node.js from nodejs.org |
| App shows blank white screen | Check Firebase keys in `src/firebase/config.js` |
| "Cannot connect" error on login | Make sure Firestore is enabled in Firebase Console |
| Data not saving | In Firebase Console → Firestore → Rules → make sure `allow read, write: if true` |
| Can't install on iPhone | Must use **Safari** browser, not Chrome |
| `npm install` fails | Delete `node_modules` folder and run `npm install` again |
| Multiple admins seeing old data | Real-time sync requires internet. Check connection. |

---

## 🔐 Security Note

The current Firestore rules allow open read/write (good for private family/institute use). If you want to add password security later, enable Firebase Authentication and update the rules. Ask Claude for help!

---

*DriveTrack Pro v2.0 — Built with React + Firebase + Vercel*
*Real-time · Multi-admin · PWA · Mobile-first*
