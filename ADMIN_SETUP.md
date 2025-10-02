# Namma Pothole - Admin Dashboard Setup Guide

## 🎯 Overview
This admin dashboard allows Chief Engineers (zone-wise) and Superintendent Engineers (all zones) to manage pothole complaints with status updates and evidence uploads.

## 📋 Prerequisites

1. **Supabase Account** - Create at [supabase.com](https://supabase.com)
2. **MongoDB Database** - Running and connected
3. **Redis** - Running for session management
4. **AWS S3** - Configured for image storage

## 🚀 Quick Start

### Step 1: Supabase Setup

1. Create a new Supabase project
2. Run this SQL in Supabase SQL Editor:

```sql
-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('chief_engineer', 'superintendent_engineer')),
  zone TEXT,
  zone_id INTEGER CHECK (zone_id >= 0 AND zone_id <= 9),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_zone ON public.admin_users(zone);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data" ON public.admin_users
  FOR SELECT USING (auth.uid() = id);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  admin_user_id UUID REFERENCES public.admin_users(id),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  evidence_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_complaint_id ON public.audit_logs(complaint_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (true);
```

3. Get your credentials from **Project Settings → API**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Environment Variables

Add to `/backend/.env`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_jwt_secret_here
JWT_EXPIRES_IN=24h
```

### Step 3: Create Admin Users

Run the seed script to create 10 Chief Engineers + 1 Superintendent:

```bash
cd backend
node scripts/seedAdminUsers.js
```

This will output credentials like:
```
✅ Created: chief.engineer.zone0@nammapothole.com
   Password: ChiefZone0@2025
   Role: chief_engineer
   Zone: North-Zone2 (ID: 0)

✅ Created: superintendent@nammapothole.com
   Password: Superintendent@2025
   Role: superintendent_engineer
```

**⚠️ IMPORTANT: Change these default passwords after first login!**

### Step 4: Start the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 🔐 Admin Credentials

### Chief Engineers (Zone-specific access)
- Zone 0 (North-Zone2): `chief.engineer.zone0@nammapothole.com`
- Zone 1 (East-Zone2): `chief.engineer.zone1@nammapothole.com`
- Zone 2 (Central-Zone2): `chief.engineer.zone2@nammapothole.com`
- Zone 3 (North-Zone1): `chief.engineer.zone3@nammapothole.com`
- Zone 4 (East-Zone1): `chief.engineer.zone4@nammapothole.com`
- Zone 5 (Central-Zone1): `chief.engineer.zone5@nammapothole.com`
- Zone 6 (West-Zone2): `chief.engineer.zone6@nammapothole.com`
- Zone 7 (South-Zone2): `chief.engineer.zone7@nammapothole.com`
- Zone 8 (West-Zone1): `chief.engineer.zone8@nammapothole.com`
- Zone 9 (South-Zone1): `chief.engineer.zone9@nammapothole.com`

Default password for all: `ChiefZone{N}@2025` (where {N} is 0-9)

### Superintendent Engineer (All zones access)
- Email: `superintendent@nammapothole.com`
- Password: `Superintendent@2025`

## 📱 Admin Features

### Chief Engineer Dashboard
- View complaints only from their assigned zone
- Update status: `reported` → `in_progress`
- Upload evidence image and mark as `resolved`
- Zone-specific statistics
- Real-time zone detection using Turf.js

### Superintendent Engineer Dashboard
- View complaints from all 10 zones
- Update status for any complaint
- Upload evidence for any complaint
- Zone-wise breakdown statistics
- Comparative analytics across zones

## 🎨 Status Workflow

```
reported → in_progress → resolved
```

- **Reported**: Citizen submitted complaint
- **In Progress**: Chief Engineer marked as being worked on
- **Resolved**: Chief Engineer uploaded evidence photo + marked complete

## 🔧 API Endpoints

### Authentication
- `POST /admin/login` - Admin login
- `GET /admin/profile` - Get current admin profile

### Complaints Management
- `GET /admin/complaints` - Get zone-filtered complaints
- `GET /admin/complaints/:id` - Get single complaint
- `PATCH /admin/complaints/:id/status` - Update complaint status
- `POST /admin/complaints/:id/evidence` - Upload evidence (auto-resolves)

### Statistics
- `GET /admin/stats` - Get zone-specific statistics

All admin endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🗺️ Zone Structure

Bengaluru is divided into 10 zones based on `map.geojson`:

| Zone ID | Zone Name | Corporation |
|---------|-----------|-------------|
| 0 | North-Zone2 | North |
| 1 | East-Zone2 | East |
| 2 | Central-Zone2 | Central |
| 3 | North-Zone1 | North |
| 4 | East-Zone1 | East |
| 5 | Central-Zone1 | Central |
| 6 | West-Zone2 | West |
| 7 | South-Zone2 | South |
| 8 | West-Zone1 | West |
| 9 | South-Zone1 | South |

Zones are detected in real-time using coordinates and Turf.js `booleanPointInPolygon`.

## 📸 Evidence Upload Requirements

- **Formats**: JPEG, JPG, PNG
- **Max Size**: 1MB
- **Upload Method**: Drag & drop or file picker
- **Compression**: Automatic (Sharp.js)
- **Storage**: AWS S3
- **Requirement**: Mandatory for marking complaint as "resolved"

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Zone-based data filtering
- Audit logging for all status changes
- Supabase Row Level Security (RLS)

## 📊 Audit Trail

All admin actions are logged in Supabase:
- Status changes
- Evidence uploads
- Admin user details
- Timestamps

Query audit logs:
```sql
SELECT * FROM audit_logs 
WHERE complaint_id = 'xxx' 
ORDER BY timestamp DESC;
```

## 🐛 Troubleshooting

### "Token expired" error
- Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
- Login again to get a new token

### "Access denied" error
- Chief Engineers can only access their zone's complaints
- Superintendent can access all zones

### Evidence upload fails
- Check file size (< 1MB)
- Check file format (JPEG/JPG/PNG only)
- Verify S3 credentials in `.env`

### Zone showing as "null"
- Complaint coordinates may be outside defined zones
- Check `map.geojson` boundaries
- Verify Turf.js is installed

## 🚀 Deployment

For production:

1. Update `VITE_API_BASE_URL` in frontend `.env`
2. Update CORS origins in `backend/index-waba.js`
3. Use strong JWT secret (not the default)
4. Change all default admin passwords
5. Enable HTTPS (handled by Caddy)
6. Set up Docker containers (see `docker-compose.yml`)

## 📝 Notes

- Backend runs on port 3000
- Frontend runs on port 8080 (in Docker) or 5173 (dev)
- Admin routes: `/admin/login` and `/admin/dashboard`
- Public dashboard: `/`

## 🆘 Support

For issues or questions, contact the development team.

---

Built with ❤️ for Bengaluru's pothole management system.

