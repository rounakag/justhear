# Supabase Setup Guide for JustHear

## 🚀 Step 1: Create Supabase Project

1. **Go to**: https://supabase.com
2. **Sign up/Login** with your GitHub account
3. **Create new project**:
   - **Name**: `justhear-db`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Wait for setup** (2-3 minutes)

## 🔑 Step 2: Get Connection Details

1. **Go to Settings → API** in your Supabase dashboard
2. **Copy these values**:
   - **Project URL**: `https://your-project.supabase.co`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🗄️ Step 3: Set Up Database

1. **Go to SQL Editor** in Supabase dashboard
2. **Copy and paste** the contents of `database/schema.sql`
3. **Run the script** to create all tables and policies

## ⚙️ Step 4: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Google Meet Integration (for future use)
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
```

## 🔧 Step 5: Install Dependencies

```bash
cd backend
npm install @supabase/supabase-js
```

## 🧪 Step 6: Test Database Connection

The backend will automatically connect to Supabase when you restart it.

## 📊 Database Schema Overview

### Tables Created:
- **users**: User accounts (users, listeners, admins)
- **listener_profiles**: Listener-specific information
- **time_slots**: Available time slots for booking
- **bookings**: User bookings with meeting links
- **reviews**: User reviews and ratings
- **sessions**: Completed session tracking

### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensure users can only access their own data
- **Admin access** to all data
- **Public access** to available slots only

## 🔗 Meeting Link Generation

### Current Implementation:
- **Google Meet links** generated automatically on booking
- **Simple format**: `https://meet.google.com/abc-defg-hij`
- **No authentication required** for basic links

### Future Enhancements:
- **Google Calendar API** integration
- **Calendar events** creation
- **Email notifications** with meeting details
- **Zoom/Teams** integration options

## 👥 Multi-Listener Management

### Current State:
- **Single listener** (listener1) with mock data
- **Admin can manage** all slots

### Future Implementation:
- **Listener registration** system
- **Individual listener dashboards**
- **Listener-specific slot management**
- **Listener profiles** and specialties

## 🚀 Next Steps

1. **Set up Supabase** following this guide
2. **Update environment variables**
3. **Test database connection**
4. **Deploy backend** with real database
5. **Test booking flow** with meeting links
6. **Add listener management** features

## 🔒 Security Notes

- **Service Role Key** has full database access (keep secret!)
- **Anon Key** for client-side operations
- **RLS policies** protect user data
- **Environment variables** should be secure in production

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard for errors
2. Verify environment variables
3. Check database logs in Supabase
4. Ensure RLS policies are working correctly
