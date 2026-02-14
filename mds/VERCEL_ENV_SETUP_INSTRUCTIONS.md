# Vercel Environment Variables Setup

## 🚀 Deployment Successful!

Your application is live at: **https://todo-app-phase2-beta.vercel.app**

## ⚙️ Environment Variables Configuration Required

### Step 1: Open Vercel Dashboard

Go to: https://vercel.com/abdul-rehmans-projects-80ec3c02/todo-app-phase2/settings/environment-variables

### Step 2: Add These Environment Variables

Copy and paste each variable exactly as shown:

#### Backend Variables:

```
DATABASE_URL=sqlite:////tmp/todo.db
```

```
JWT_SECRET_KEY=your-secure-jwt-secret-key-here
```

```
JWT_ALGORITHM=HS256
```

```
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

```
COHERE_API_KEY=your-cohere-api-key-here
```

> **Note**: Replace placeholder values with your actual keys from your local `.env` files.

#### Frontend Variables:

```
NEXT_PUBLIC_API_URL=https://abdul18-todo-web.hf.space
```

```
NEXT_PUBLIC_APP_NAME=Todo App
```

```
BETTER_AUTH_SECRET=your-better-auth-secret-here
```

```
AUTH_URL=https://your-vercel-app.vercel.app
```

> **Note**: Use your actual Better Auth secret from your local `.env` file.

### Step 3: Redeploy

After adding all environment variables:

1. Go to: https://vercel.com/abdul-rehmans-projects-80ec3c02/todo-app-phase2
2. Click on the latest deployment
3. Click "Redeploy" button
4. Wait for deployment to complete (1-2 minutes)

### Step 4: Test Your Application

Once redeployed, test these URLs:

- **Frontend**: https://todo-app-phase2-beta.vercel.app
- **API Docs**: https://todo-app-phase2-beta.vercel.app/docs
- **Health Check**: https://todo-app-phase2-beta.vercel.app/api/health (should return `{"status":"healthy"}`)

### Step 5: Create Test Account

1. Go to: https://todo-app-phase2-beta.vercel.app/sign-up
2. Create a new account
3. Sign in and start using the app!

## 📝 Important Notes

1. **SQLite Limitation**: Current setup uses SQLite which doesn't persist data in Vercel serverless environment. For production, consider using PostgreSQL (Vercel Postgres, Supabase, or Neon).

2. **Environment Variables**: Make sure all variables are set for "Production" environment in Vercel dashboard.

3. **CORS**: The CORS_ORIGINS includes both your production URLs to ensure proper API access.

## 🔗 Quick Links

- **Live App**: https://todo-app-phase2-beta.vercel.app
- **API Documentation**: https://todo-app-phase2-beta.vercel.app/docs
- **Vercel Dashboard**: https://vercel.com/abdul-rehmans-projects-80ec3c02/todo-app-phase2
- **GitHub Repo**: https://github.com/AbdulRehman2106/Hackathon-Phase-2-Todo-Web

## ✅ Deployment Summary

- ✅ Frontend deployed successfully
- ✅ Backend API deployed successfully
- ✅ All routes configured properly
- ⚙️ Environment variables need to be set (follow steps above)
- ⚙️ Redeploy required after setting variables

## 🎉 Once Complete

Your full-stack Todo application will be live with:
- User authentication (signup/signin)
- Task management (create, read, update, delete)
- Subtasks support
- Password reset functionality
- Recurring tasks
- AI-powered features (Cohere integration)
