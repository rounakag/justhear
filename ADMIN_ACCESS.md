# Admin Access Guide

## Overview
The admin panel is completely separate from the main application and is only accessible via dedicated admin URLs. Regular users have no way to access admin functionality.

## Admin URLs

### Admin Login
- **URL:** `/admin/login`
- **Purpose:** Admin authentication page
- **Access:** Public (but requires valid admin credentials)

### Admin Dashboard
- **URL:** `/admin/dashboard`
- **Purpose:** Main admin interface with slot management
- **Access:** Requires admin authentication

## Demo Admin Credentials

For testing purposes, use these credentials:

- **Email:** `admin@justhear.com`
- **Password:** `JustHearAdmin2024!`

## How to Access Admin Panel

1. **Direct URL Access:**
   - Navigate to `http://localhost:3000/admin/login`
   - Enter admin credentials
   - You'll be redirected to `/admin/dashboard`

2. **Bookmark the URL:**
   - Save `/admin/login` as a bookmark for easy access
   - This is the recommended approach for admin users

## Security Features

- **Complete Separation:** Admin functionality is completely isolated from the main app
- **No UI Indicators:** Regular users see no admin-related buttons or links
- **Route Protection:** Admin routes redirect to login if not authenticated
- **Session Management:** Admin sessions are managed separately from user sessions

## Development Notes

- Admin routes are handled by React Router
- Authentication state is managed by `useAdminAuth` hook
- All admin components are in `/src/components/admin/`
- Admin pages are in `/src/pages/`

## Production Deployment

In production, consider:
- Using HTTPS for admin routes
- Implementing additional security measures (2FA, IP restrictions)
- Setting up proper admin user management
- Configuring proper session timeouts
- Adding audit logging for admin actions
