# 🌐 LokConnect — Hyperlocal Community Networking Platform

<div align="center">

![LokConnect](https://img.shields.io/badge/LokConnect-Hyperlocal%20Community-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0yMSAxMGMwIDctOSAxMy05IDEzcy05LTYtOS0xM2E5IDkgMCAwIDEgMTggMFoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+)

**Connect with your roots. Build your community. Preserve your culture.**

A full-stack hyperlocal community networking platform where people from the same city, village, or hometown can connect digitally, organize events, share updates, and collaborate locally.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47a248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io)](https://socket.io/)

</div>

---

## ✨ Features

- 🏘️ **Community System** — Create, join, and manage hyperlocal communities
- 📝 **Social Feed** — Posts, polls, announcements with likes, comments, bookmarks
- 📅 **Event Management** — Create events, RSVP, countdown timers
- 🔔 **Real-time Notifications** — Socket.io powered instant alerts
- 🛡️ **Moderation Tools** — Report system, content moderation, admin controls
- 🏆 **Gamification** — Badges, contribution points, community levels
- 📊 **Admin Dashboard** — Analytics with charts, user & community management
- 🌙 **Dark/Light Mode** — Premium UI with glassmorphism and smooth animations
- 📱 **Mobile-First** — Fully responsive with bottom navigation
- 🔒 **Secure Auth** — JWT, bcrypt, role-based access control

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| UI | Framer Motion, Lucide Icons, Recharts |
| State | Zustand |
| Backend | Express.js, Node.js, TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.io |
| Storage | Cloudinary |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

### 2. Configure Environment

Edit `backend/.env` with your MongoDB URI and JWT secret.

### 3. Seed Database (Optional)

```bash
cd backend
npm run seed
```

This creates demo users, communities, posts, and events.

**Test Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lokconnect.com | password123 |
| User | priya@example.com | password123 |
| User | rahul@example.com | password123 |

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 5. Docker (Alternative)

```bash
docker-compose up --build
```

## 📁 Project Structure

```
├── frontend/          # Next.js 15 App
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/ # Reusable components
│       ├── store/     # Zustand stores
│       ├── lib/       # API client, utilities
│       └── types/     # TypeScript definitions
│
├── backend/           # Express.js API
│   └── src/
│       ├── config/    # Database, Cloudinary config
│       ├── models/    # Mongoose schemas
│       ├── routes/    # API route definitions
│       ├── controllers/ # Route handlers
│       ├── middleware/ # Auth, validation, errors
│       ├── socket/    # Socket.io setup
│       └── utils/     # Helpers, seed script
│
├── docs/              # Documentation
└── docker-compose.yml # Docker setup
```

## 📡 API Endpoints

| Group | Endpoints | Auth |
|-------|----------|------|
| Auth | POST /register, /login, /forgot-password | Public |
| Users | GET/PUT profile, search | Protected |
| Communities | CRUD, join/leave, members | Protected |
| Posts | CRUD, like, bookmark, pin, poll vote | Protected |
| Comments | CRUD, like, nested replies | Protected |
| Events | CRUD, RSVP, upcoming | Protected |
| Notifications | List, mark read | Protected |
| Admin | Stats, manage users/communities/reports | Admin Only |

## 🎨 Design

- **Color Palette**: Deep blue & purple gradients on dark backgrounds
- **Effects**: Glassmorphism, soft shadows, micro-animations
- **Typography**: Inter (Google Fonts)
- **Components**: Cards with hover effects, skeleton loaders, animated transitions

## 📦 Deployment

| Service | Platform |
|---------|---------|
| Frontend | Vercel |
| Backend | Render / Railway |
| Database | MongoDB Atlas |
| Storage | Cloudinary |

## 📄 License

MIT License — Built with ❤️ for communities.
