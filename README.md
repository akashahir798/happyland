# Happy Land Hotel Management System

A comprehensive hotel management web application with room booking, food ordering, event management, and admin dashboard.

## Project Structure

```
happy-land/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── database/  # Database configuration and migrations
│   │   ├── middleware/# Auth middleware
│   │   ├── routes/    # API routes
│   │   └── index.js   # Server entry point
│   └── package.json
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/# React components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API services
│   │   └── store/     # State management
│   └── package.json
└── package.json       # Root workspace configuration
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

## Setup Instructions

### 1. Install Dependencies

```
bash
npm install
```

### 2. Configure Environment Variables

#### Backend (.env)
Located in `backend/.env`:

```
env
DB_HOST=db.dfupdppmyccpzcpykqjm.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=A9crFNriRnv86iuU
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
Located in `frontend/.env`:

```
env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Happy Land Hotel
```

### 3. Database Setup

**Option A: Automatic Migration**
```bash
npm run db:migrate
```

**Option B: Manual Setup**
If the automatic migration fails, you can manually run the SQL schema in your Supabase dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project (dfupdppmyccpzcpykqjm)
3. Go to the SQL Editor
4. Copy and run the contents of `backend/src/database/schema.sql`

### 4. Build the Frontend

```
bash
npm run build
```

### 5. Run the Application

**Development Mode:**
```
bash
npm run dev
```

This will start both the backend (http://localhost:3001) and frontend (http://localhost:5173).

**Production:**
```
bash
# Build first
npm run build

# Start backend
npm run start
```

## Features

- **Room Booking**: Browse and book hotel rooms
- **Food Ordering**: In-room dining with menu
- **Event Management**: Book event spaces for conferences/events
- **User Authentication**: Register, login, profile management
- **Admin Dashboard**: Manage bookings, users, and view analytics

## API Endpoints

- `/api/auth` - Authentication (register, login)
- `/api/rooms` - Room management
- `/api/bookings` - Booking management
- `/api/food` - Food & beverage orders
- `/api/events` - Event bookings
- `/api/admin` - Admin dashboard

## Troubleshooting

### Database Connection Issues

If you see "ENOTFOUND" or "ENETUNREACH" errors when running migrations:

1. **Check if Supabase project is paused**
   - Go to https://supabase.com/dashboard
   - Select your project
   - If paused, click "Restore project"

2. **Verify credentials**
   - Check that DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD are correct
   - Ensure your IP is allowed in Supabase settings

3. **Network issues**
   - Check your internet connection
   - Try disabling VPN/firewall temporarily

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, React Router
- **Backend**: Node.js, Express, PostgreSQL (via Supabase)
- **Authentication**: JWT tokens

## License

MIT
