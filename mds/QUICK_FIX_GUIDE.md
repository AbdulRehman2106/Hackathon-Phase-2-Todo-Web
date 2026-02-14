# Quick Fix Guide - CORS Error on Vercel

## Aapka Current Problem:
```
Access to XMLHttpRequest at 'https://your-backend-url.vercel.app/api/auth/signin'
from origin 'https://hackathon-phase-2-todo-web.vercel.app' has been blocked by CORS policy
```

## Root Cause:
1. Backend properly deploy nahi hua (api/index.py missing thi)
2. Frontend placeholder URL use kar raha hai
3. CORS configuration mein frontend URL missing hai

## ✅ Files Fixed:
- ✅ `backend/api/index.py` - Created with Mangum wrapper
- ✅ `backend/requirements.txt` - Added mangum dependency
- ✅ `backend/src/main.py` - Updated CORS configuration
- ✅ `backend/vercel.json` - Updated for proper routing

## 🚀 Ab Kya Karna Hai:

### Option 1: Separate Backend Deploy (Recommended)

**Step 1: Backend Deploy**
```bash
cd backend
vercel --prod
```

Yeh command run karne ke baad aapko backend URL milega, jaise:
`https://phase-2-backend-xyz.vercel.app`

**Step 2: Backend Environment Variables (Vercel Dashboard)**

Vercel dashboard mein jao aur yeh variables add karo:
```
JWT_SECRET_KEY=your-super-secret-key-min-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo.db
CORS_ORIGINS=https://hackathon-phase-2-todo-web.vercel.app,http://localhost:3000
FRONTEND_URL=https://hackathon-phase-2-todo-web.vercel.app
```

**Step 3: Frontend Environment Variables Update**

Frontend ke Vercel dashboard mein jao aur update karo:
```
NEXT_PUBLIC_API_URL=https://phase-2-backend-xyz.vercel.app
```
(Apna actual backend URL use karo)

**Step 4: Frontend Redeploy**
```bash
cd frontend
vercel --prod
```

### Option 2: Monorepo Deploy (Single Project)

Agar aap dono ko ek saath deploy karna chahte ho:

**Step 1: Root se deploy karo**
```bash
vercel --prod
```

**Step 2: Environment Variables (Root Project)**

Backend variables:
```
JWT_SECRET_KEY=your-super-secret-key-min-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo.db
CORS_ORIGINS=https://your-project.vercel.app,http://localhost:3000
FRONTEND_URL=https://your-project.vercel.app
```

Frontend variables:
```
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
NEXT_PUBLIC_APP_NAME=Todo Application
```

**Step 3: Redeploy**
```bash
vercel --prod
```

## 🔍 Verify Deployment:

1. **Backend health check:**
   ```
   https://your-backend-url.vercel.app/health
   ```
   Should return: `{"status": "healthy"}`

2. **Backend API docs:**
   ```
   https://your-backend-url.vercel.app/docs
   ```

3. **Frontend:**
   ```
   https://hackathon-phase-2-todo-web.vercel.app
   ```

## ⚠️ Important Notes:

1. **CORS_ORIGINS mein actual frontend URL dalo** - placeholder nahi
2. **NEXT_PUBLIC_API_URL mein actual backend URL dalo** - placeholder nahi
3. **Environment variables change ke baad redeploy zaruri hai**
4. **Pehle backend deploy karo, phir frontend**

## 🐛 Agar Abhi Bhi Error Aaye:

1. **Check Vercel logs:**
   ```bash
   vercel logs [your-deployment-url]
   ```

2. **Browser console check karo (F12)**

3. **Verify environment variables:**
   - Vercel dashboard → Settings → Environment Variables

4. **CORS test karo:**
   ```bash
   curl -H "Origin: https://hackathon-phase-2-todo-web.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://your-backend-url.vercel.app/api/auth/signin
   ```

## 📝 Current Status:

- ✅ Backend code fixed
- ✅ CORS configuration updated
- ✅ Vercel deployment files ready
- ⏳ Need to deploy with correct environment variables
- ⏳ Need to update frontend API URL

**Next Action:** Deploy backend first, get URL, then update frontend environment variables.
