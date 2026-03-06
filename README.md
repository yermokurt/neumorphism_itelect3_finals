# PostPal 📣

A moderated community posting platform where users can publish posts, interact through comments, and administrators manage moderation and analytics.

---

## Overview

**PostPal** is a full-stack web application built with:
- **Frontend**: React + Tailwind CSS (Glassmorphism UI)
- **Backend**: Node.js + Express + MySQL

Users can create posts (subject to admin approval), like posts, leave comments, and report inappropriate content. Admins have a dedicated dashboard for moderation and reports.

---

## Features

### User Features
- ✅ Register & Login with JWT authentication
- ✅ Browse the community Wall (approved posts)
- ✅ Filter posts by category
- ✅ Create posts with optional image and anonymous mode
- ✅ Like / unlike posts
- ✅ Comment on posts
- ✅ Report posts (Spam, Harassment, Misinformation, Other)
- ✅ View profile with personal stats and post history

### Admin Features
- ✅ Approve or reject pending posts
- ✅ Delete any post
- ✅ View and manage reports
- ✅ Delete comments
- ✅ Admin posts are auto-approved
- ✅ Dashboard with platform statistics

---

## User Flow

1. Register at `/register`
2. Login at `/login`
3. Browse the Wall at `/`
4. Create a post at `/create` — waits for admin approval
5. View your profile at `/profile`

## Admin Flow

1. Login with admin credentials
2. Redirected to **Moderation Dashboard** (`/admin/moderation`)
3. Approve / reject / delete pending posts
4. Go to **Reports** (`/admin/reports`) to manage flagged content

---

## Database Schema

| Table | Description |
|-------|-------------|
| `users` | All registered accounts (users and admins via role column) |
| `posts` | Community posts with status (PENDING / APPROVED / REJECTED) |
| `post_likes` | Tracks user likes to prevent duplicates |
| `comments` | Post comments with timestamps |
| `reports` | User-submitted reports with reason and status |

---

## Installation Guide

### Prerequisites
- Node.js (v16+)
- MySQL (with phpMyAdmin or CLI)

### 1. Database Setup

1. Open **phpMyAdmin** (or MySQL CLI)
2. Create a new database called `postpal_db`
3. Import the schema:
   ```
   postpal/database/schema.sql
   ```
   This creates all tables and inserts a default admin account.

**Default Admin Credentials:**
- Email: `admin@postpal.com`
- Password: `admin123`

---

### 2. Backend Setup

```bash
cd postpal/server
npm install
```

Edit `.env` if needed (DB credentials):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=postpal_db
JWT_SECRET=postpal_super_secret_key_2024
```

Start the server:
```bash
npm start
# Server runs at http://localhost:5000
```

---

### 3. Frontend Setup

```bash
cd postpal/client
npm install
npm start
# React app runs at http://localhost:3000
```

---

## Running Both (two terminals)

**Terminal 1 — Backend:**
```bash
cd postpal/server
npm start
```

**Terminal 2 — Frontend:**
```bash
cd postpal/client
npm start
```

Then open your browser at **http://localhost:3000**

---

## Project Structure

```
postpal/
├── database/
│   └── schema.sql             # MySQL schema
├── server/
│   ├── server.js              # Main Express app
│   ├── db.js                  # MySQL connection pool
│   ├── .env                   # Environment variables
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── posts.routes.js
│   │   ├── comments.routes.js
│   │   ├── reports.routes.js
│   │   └── admin.routes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postsController.js
│   │   ├── commentsController.js
│   │   ├── reportsController.js
│   │   └── adminController.js
│   └── uploads/               # Uploaded images stored here
└── client/
    ├── src/
    │   ├── App.js             # Main router
    │   ├── index.css          # Global styles + Tailwind
    │   ├── api/axios.js       # Axios with JWT interceptor
    │   ├── context/AuthContext.js
    │   ├── components/Navbar.js
    │   └── pages/
    │       ├── LoginPage.js
    │       ├── RegisterPage.js
    │       ├── WallPage.js
    │       ├── CreatePostPage.js
    │       ├── ProfilePage.js
    │       ├── AdminModerationPage.js
    │       └── ReportsPage.js
    └── tailwind.config.js
```
