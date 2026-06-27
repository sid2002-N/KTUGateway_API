# KTU App Scraper API

![KTU API Banner](assets/banner.png)

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20+-green.svg" alt="Node.js version">
  <img src="https://img.shields.io/badge/TypeScript-5.4-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Platform-Railway-darkviolet.svg" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

A modernized, high-performance scraping API for **APJ Abdul Kalam Technological University (KTU)**. It logs into the official KTU portal using a headless Puppeteer browser, bypasses modern bot detection, extracts full student profiles, grades for all 8 semesters, CGPA/SGPA, and activity points, and caches the results in Redis. It also monitors official announcements and schedules notifications.

---

## ⚡ Features
- **Modern Tech Stack**: Built with TypeScript, powered by `tsup` (esbuild compilation) and `tsx` (fast development run).
- **Resilient Automation**: Uses a headless Puppeteer browser with optimized headers and fingerprinting to bypass KTU's security.
- **Smart Caching**: Implements Redis-native `v4` client caching for student data (24-hour expiration) to prevent overloading the KTU portal.
- **Announcement Monitor**: Includes a scheduler using `node-cron` that fetches latest university notifications and triggers alerts via Slack and Firebase Cloud Messaging (FCM).
- **Production Ready**: Equipped with `helmet` for security headers, request rate limiting, centralized error handling, and `pino` for high-performance structured JSON logging.

---

## 🚀 How to Start

### 1. Installation
Install the dependencies using the legacy peer-deps flag to resolve dependency constraints:
```bash
npm install --legacy-peer-deps
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Fill in the variables in `.env`:
```env
PORT=3000
NODE_ENV=development

# Redis Connection Details
REDIS_HOST=your-redis-host.com
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-password

# API Key Validation (used to secure endpoints)
API_KEY=your-secure-64-character-hex-key

# Path to store downloaded profile photos
IMAGE_PATH=./public
IMAGE_URL=http://localhost:3000/images/

# Firebase Credentials (JSON string format or location configuration)
FIREBASE_DB_URL=https://your-firebase-database-url.firebaseio.com
FIREBASE_SERVICE_ACCOUNT={"type":"service_account", ...}

# Slack Notifications (Optional)
SLACK_TOKEN=xoxb-your-token
SLACK_CHANNEL=C0XXXXXXXXX
```

### 3. Running Locally

* **Development (Watch Mode)**:
  ```bash
  npm run dev
  ```
* **Build (Production Build)**:
  ```bash
  npm run build
  ```
* **Start (Compiled Server)**:
  ```bash
  npm run start
  ```

---

## 🛰️ API Endpoints

### `POST /api/v1/data`
Fetches and compiles details for a student.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "userid": "MZC20CS031",
    "password": "your-portal-password",
    "key": "your-secure-64-character-hex-key"
  }
  ```
* **Response (Success - 200 OK)**:
  ```json
  {
    "username": "JOHN DOE",
    "userid": "ABC20CS001",
    "proimg": "http://localhost:3000/images/ABC20CS001.jpg",
    "Gender": "Male",
    "Branch": "Computer Science and Engineering",
    "S1": [
      {
        "slot": "A",
        "course": "MAT101 - LINEAR ALGEBRA AND CALCULUS",
        "credit": "4.0",
        "type": "Valuation by university",
        "completed": "Yes",
        "grade": "No",
        "earned": "A+"
      }
    ],
    "S1sgpa": "8.5",
    "activityPoints": {
      "2021-2022": "10",
      "TotalPoints": "80"
    }
  }
  ```

### `GET /api/v1/notifications`
Gets the latest cached KTU announcements.

* **Response (Success - 200 OK)**:
  ```json
  {
    "notifications": [
      {
        "date": "Mon Jan 01 00:00:00 IST 2024",
        "heading": "Result of B.Tech S6 Examination Published",
        "key": "result-of-btech-s6-examination-published",
        "data": "The result of B.Tech S6 Examination is published herewith."
      }
    ]
  }
  ```

### `GET /`
Basic healthcheck response.
```json
{
  "status": "working",
  "version": "2.0.0"
}
```

---

## 🐳 Docker & Hosting
The project is fully preconfigured for containerized deployment on hosting services like **Railway**, **Render**, or **DigitalOcean**. 

The included `Dockerfile` takes care of installing a custom slim Chromium binary and configuring correct system libraries needed for Puppeteer execution. To deploy:
1. Push your repository to **GitHub**.
2. Connect the repository to **Railway** or **Render**.
3. Supply the environment variables in the provider dashboard.
4. Set the `PUPPETEER_EXECUTABLE_PATH` variable to `/usr/bin/chromium`.
