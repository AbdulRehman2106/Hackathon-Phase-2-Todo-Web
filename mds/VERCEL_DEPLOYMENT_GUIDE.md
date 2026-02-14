# Vercel Deployment Guide - Todo Application

## Problem Solved
Yeh guide CORS error aur deployment issues ko fix karti hai.

## Step-by-Step Deployment

### Step 1: Backend Deploy Karo (Pehle Backend)

1. **Vercel par naya project banao (Backend ke liye)**
   ```bash
   cd backend
   vercel
   ```

2. **Deployment settings:**
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

3. **Environment Variables add karo Vercel dashboard mein:**
   ```
   JWT_SECRET_KEY=your-super-secret-key-min-32-characters-long
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   DATABASE_URL=sqlite:///./todo.db
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

4. **Backend URL note karo:**
   - Example: `https://your-backend-abc123.vercel.app`

### Step 2: Frontend Deploy Karo (Backend ke baad)

1. **Frontend environment variables update karo:**

   Vercel dashboard mein jao aur yeh environment variables add karo:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-abc123.vercel.app
   NEXT_PUBLIC_APP_NAME=Todo Application
   ```

2. **Frontend deploy karo:**
   ```bash
   cd frontend
   vercel
   ```

3. **Deployment settings:**
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Frontend URL note karo:**
   - Example: `https://your-frontend-xyz789.vercel.app`

### Step 3: Backend CORS Update Karo

1. **Backend ke Vercel dashboard mein jao**
2. **Environment Variables mein `CORS_ORIGINS` update karo:**
   ```
   CORS_ORIGINS=https://your-frontend-xyz789.vercel.app,http://localhost:3000
   ```

3. **Redeploy karo:**
   - Vercel dashboard → Deployments → Latest deployment → Redeploy

### Step 4: Test Karo

1. Frontend URL kholo: `https://your-frontend-xyz789.vercel.app`
2. Sign up karo
3. Sign in karo
4. Tasks create karo

## Common Issues & Solutions

### Issue 1: CORS Error
**Error:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
- Backend environment variables mein `CORS_ORIGINS` mein frontend URL add karo
- Backend redeploy karo

### Issue 2: "your-backend-url.vercel.app" Error
**Error:** Cannot connect to placeholder URL

**Solution:**
- Frontend environment variables mein `NEXT_PUBLIC_API_URL` ko real backend URL se replace karo
- Frontend redeploy karo

### Issue 3: 404 on API Routes
**Error:** API endpoints not found

**Solution:**
- Check karo `backend/api/index.py` file exists
- Check karo `backend/vercel.json` configuration correct hai

## Environment Variables Checklist

### Backend (Vercel Dashboard)
- [ ] JWT_SECRET_KEY
- [ ] JWT_ALGORITHM
- [ ] ACCESS_TOKEN_EXPIRE_MINUTES
- [ ] DATABASE_URL
- [ ] CORS_ORIGINS (with actual frontend URL)
- [ ] FRONTEND_URL (with actual frontend URL)

### Frontend (Vercel Dashboard)
- [ ] NEXT_PUBLIC_API_URL (with actual backend URL)
- [ ] NEXT_PUBLIC_APP_NAME

## Quick Commands

```bash
# Backend deploy
cd backend
vercel --prod

# Frontend deploy
cd frontend
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs [deployment-url]
```

## Important Notes

1. **Pehle Backend deploy karo**, phir Frontend
2. **Real URLs use karo**, placeholders nahi
3. **CORS_ORIGINS mein frontend URL add karna zaruri hai**
4. **Environment variables change karne ke baad redeploy karo**
5. **SQLite production mein limited hai** - consider PostgreSQL for production

## Database Note

Current setup SQLite use kar raha hai jo Vercel serverless functions mein persist nahi hota. Production ke liye:

1. **PostgreSQL use karo** (Vercel Postgres, Supabase, ya Neon)
2. **DATABASE_URL update karo:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   ```

## Support

Agar issues aaye to:
1. Vercel logs check karo: `vercel logs`
2. Browser console check karo (F12)
3. Environment variables verify karo
4. CORS configuration check karo
