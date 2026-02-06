# Portal GenBI Unsika - Integration Plan

## Overview

This document outlines the integration architecture between Portal GenBI Unsika (frontend) and GenBI Server (backend).

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Services                         │
├───────────────────┬───────────────────┬────────────────────────┤
│   portal-genbi    │   genbi-client    │     admin-genbi        │
│   (Member Portal) │   (Public Site)   │   (Admin Dashboard)    │
└─────────┬─────────┴─────────┬─────────┴──────────┬─────────────┘
          │                   │                    │
          │      REST API     │      REST API      │
          │    (Bearer Auth)  │    (Bearer Auth)   │
          └─────────┬─────────┴─────────┬──────────┘
                    │                   │
                    ▼                   ▼
          ┌─────────────────────────────────────────┐
          │            genbi-server                 │
          │                                         │
          │  ┌─────────────┐  ┌─────────────────┐  │
          │  │ REST Routes │  │   tRPC Router   │  │
          │  │ /api/v1/*   │  │   /api/trpc/*   │  │
          │  └──────┬──────┘  └────────┬────────┘  │
          │         │                  │           │
          │         └────────┬─────────┘           │
          │                  ▼                     │
          │         ┌──────────────┐               │
          │         │   Prisma ORM │               │
          │         └──────┬───────┘               │
          │                ▼                       │
          │         ┌──────────────┐               │
          │         │  PostgreSQL  │               │
          │         └──────────────┘               │
          └─────────────────────────────────────────┘
```

## Endpoints

### Authentication (`/api/v1/auth`)

- `POST /login` - Login with email/password
- `POST /google` - Login with Google ID token
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout and invalidate tokens
- `POST /register` - Register new user

### User Profile (`/api/v1/me`)

- `GET /` - Get current user profile
- `PATCH /profile` - Update profile data

### Teams/Members (`/api/v1/teams`)

- `GET /` - Get all active team members

### Events/Calendar (`/api/v1/events`)

- `GET /` - Get all events
- `GET /upcoming` - Get upcoming events
- `POST /` - Create new event (auth required)

### Leaderboard (`/api/v1/leaderboard`)

- `GET /` - Get member rankings by points
- `GET /me` - Get current user's points

### Treasury (`/api/v1/treasury`)

- `GET /` - Get treasury recap per member
- `GET /summary` - Get treasury summary totals

### Master Data (`/api/v1/master-data`)

- `GET /faculties` - Get all faculties
- `GET /faculties/:id/study-programs` - Get study programs by faculty
- `GET /study-programs` - Get all study programs

## Environment Variables

### Portal GenBI Unsika (.env.local)

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### GenBI Server (.env)

```env
# Server
PORT=4000
NODE_ENV=development

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
```

## Page Integration Status

| Page           | Status       | API Endpoint                  | Notes                                |
| -------------- | ------------ | ----------------------------- | ------------------------------------ |
| Login          | ✅ Connected | `/auth/login`, `/auth/google` | Works with email/password and Google |
| Home/Dashboard | ✅ Connected | `/teams`, `/events`           | Fetches members & events             |
| Profile        | ✅ Connected | `/me`, `/me/profile`          | View & update profile                |
| Anggota        | ✅ Connected | `/teams`                      | Lists all members by division        |
| DivisionDetail | ✅ Connected | `/teams`                      | Same data, filtered by division      |
| Calendar       | ✅ Connected | `/events`                     | Falls back to mock if empty          |
| Leaderboard    | ✅ Connected | `/leaderboard`                | Falls back to mock if empty          |
| Rekap Kas      | ✅ Connected | `/treasury`                   | Falls back to mock if empty          |

## Development Setup

1. **Start the backend:**

   ```bash
   cd genbi-server
   npm install
   npm run dev
   ```

2. **Start the portal:**

   ```bash
   cd portal-genbi-unsika
   npm install
   npm run dev
   ```

3. The portal will connect to the backend at `http://localhost:4000/api/v1`

## Next Steps

1. **Database Migrations:** Create Prisma migrations for Event, MemberPoint, TreasuryEntry models
2. **Seed Data:** Add seed scripts for testing
3. **Admin Integration:** Connect admin-genbi to the same endpoints
4. **Client Integration:** Connect genbi-client for public pages
5. **Production Deployment:** Configure CORS and environment for production

## Files Modified

### Portal GenBI Unsika

- `src/utils/api.js` - Added API functions for all endpoints
- `src/hooks/useApi.js` - Created data fetching hook
- `src/components/ui/LoadingState.jsx` - Loading indicator
- `src/components/ui/ErrorState.jsx` - Error display with retry
- `src/pages/Home.jsx` - Connected to API
- `src/pages/Profile.jsx` - Connected to API
- `src/pages/Anggota.jsx` - Connected to API
- `src/pages/Calendar.jsx` - Connected to API
- `src/pages/Leaderboard.jsx` - Connected to API
- `src/pages/RekapitulasiKas.jsx` - Connected to API

### GenBI Server

- `src/routes/index.js` - Added new routes
- `src/routes/events.routes.js` - Created events endpoints
- `src/routes/leaderboard.routes.js` - Created leaderboard endpoints
- `src/routes/treasury.routes.js` - Created treasury endpoints
