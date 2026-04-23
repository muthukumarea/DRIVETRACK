#  DriveTrack Pro — Real-Time Driving Institute Management System

A mobile-first **Progressive Web App (PWA)** built with React and Firebase to manage driving institute operations including scheduling, attendance tracking, and multi-admin coordination in real time.

---

##  Live Demo

👉 [https://drivetrack-53ab7.web.app/)

---

##  Why this project?

Driving institutes often rely on manual tracking, which leads to:

* Scheduling conflicts
* Poor coordination between instructors
* Inefficient attendance management

**DriveTrack Pro solves this by:**

* Enabling real-time updates across multiple admins
* Automating schedule generation
* Providing a mobile-first interface for on-road usability

---

##  Features

*  Multi-admin login (simultaneous access)
*  Auto schedule generation (30-minute slots)
*  Instructor-based attendance tracking
*  Real-time sync using Firebase Firestore
*  Student registry with progress tracking
*  Records filtering (date, instructor, remarks)
*  Installable PWA (Android & iOS)
*  Web dashboard for desktop access

---

##  Tech Stack

* **Frontend:** React
* **Backend / DB:** Firebase Firestore
* **Deployment:** Vercel
* **Other:** PWA (Service Workers, Manifest)

---

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/drivetrack-pro.git
cd drivetrack-pro
npm install
npm start
```

App runs at: [http://localhost:3000](http://localhost:3000)

---

## Firebase Configuration

1. Create a project at Firebase Console
2. Enable Firestore Database
3. Replace config in:

```
src/firebase/config.js
```

```js
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};
```

---

## Deployment

### Vercel (Recommended)

```bash
npm run build
```

* Upload `build/` folder to Vercel
  **or**
* Connect GitHub repo for automatic deployment

---

## Install as App (PWA)

**Android (Chrome):**

* Open site → Menu → *Add to Home Screen*

**iPhone (Safari):**

* Open site → Share → *Add to Home Screen*

---

## System Design Highlights

* Real-time updates using Firestore listeners
* Multi-user consistency without manual refresh
* Slot-based scheduling algorithm (30-min intervals)
* Mobile-first UI optimized for field usage

---

## Project Structure

```
src/
├── firebase/        # Firebase config & DB logic
├── context/         # Auth state management
├── components/      # UI components
├── pages/           # App screens
├── utils/           # Helper functions
```

---

## Security Note

* Current setup is configured for development/demo purposes
* For production:

  * Enable Firebase Authentication
  * Apply secure Firestore rules

---

## Highlights

* Built a **real-time multi-user system** using Firebase
* Designed a **mobile-first PWA** used across devices
* Implemented **automated scheduling logic**
* Solved a real-world problem for driving institutes

---

## Future Improvements

* Role-based access control
* Payment integration
* SMS/WhatsApp notifications
* Advanced analytics dashboard

---

## License

This project is for educational and demonstration purposes.


