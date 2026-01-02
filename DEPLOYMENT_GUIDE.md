# Local Happenings v2 - Deployment Guide

## ✅ Changes Committed to GitHub

All critical fixes have been committed and pushed to the repository:
- **Commit**: `ca93779`
- **Repository**: https://github.com/msclarissawhite/localhappenings-v2

## 🔧 What Was Fixed

### 1. Database Compatibility
- Fixed table names to match existing schema:
  - `event_to_event_types` → `eventToEventTypes`
  - `event_types` → `eventTypes`
- Fixed column names:
  - Removed non-existent `description` and `icon` columns
  - Using `category` column instead

### 2. SQL Query Fixes
- **LIMIT/OFFSET**: Embedded directly in SQL for TiDB compatibility (TiDB doesn't support placeholders for LIMIT/OFFSET)

### 3. Optional Services
- **Stripe**: Made completely optional - won't crash without `STRIPE_SECRET_KEY`
- **Email**: Made completely optional - won't crash without `RESEND_API_KEY`

## 📋 Required Environment Variables

When deploying, you MUST set these environment variables:

### Essential (Required)
```
DATABASE_URL=mysql://38ttAWeecoi1SEG.c77ad9ee9f43:d7Gate5K05at5gfERx4A@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/PFhmVPyUG6jUUGKxZvMEwC?ssl={"rejectUnauthorized":true}
NODE_ENV=production
JWT_SECRET=manus-jwt-secret-key-v2
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=localhappenings-v2
VITE_APP_URL=<YOUR_DEPLOYMENT_URL>
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
```

### Optional (Can be left empty)
```
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@localhappenings.com
OWNER_OPEN_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
CLICKUP_API_KEY=
CLICKUP_LIST_ID=
CLICKUP_EVENT_LIST_ID=
VITE_FRONTEND_FORGE_API_KEY=
```

## 🚀 Deployment Instructions

### Option 1: Deploy in New Manus Task
1. Start a new Manus task
2. Tell Manus: "Deploy the localhappenings-v2 repository from GitHub as a web app"
3. Provide the environment variables listed above
4. Manus will build and host it permanently

### Option 2: Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy

### Option 3: Deploy to Railway
1. Connect your GitHub repository to Railway
2. Add all environment variables in Railway dashboard
3. Deploy

## ✅ Verified Working Features

- ✅ Events loading from database (41 events)
- ✅ Browse Events page with filters
- ✅ Province/Municipality filters
- ✅ Accessibility presets
- ✅ Search functionality
- ✅ Pagination (Load More)
- ✅ Event details display
- ✅ Database connection to TiDB

## 📊 Database Status

- **Database**: TiDB Cloud (existing database)
- **Total Events**: 41 published events
- **Schema**: Compatible with v2 code after fixes
- **Connection**: Tested and working

## 🎯 Next Steps After Deployment

1. Update `VITE_APP_URL` to your permanent deployment URL
2. Test all functionality on the live site
3. (Optional) Configure Stripe if you want to enable donations
4. (Optional) Configure Resend if you want email notifications

## 📝 Notes

- The `.env` file is NOT committed to GitHub (for security)
- You must manually set environment variables in your deployment platform
- The database URL contains your credentials - keep it secure
- The current working version is tested at: https://3000-ien74ykhzyouknl2fb34y-76246a0b.us2.manus.computer (temporary)
