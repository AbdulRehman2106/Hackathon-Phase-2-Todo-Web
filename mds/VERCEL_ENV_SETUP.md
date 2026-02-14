# Vercel Environment Variables Setup Guide

## ✅ Already Configured (11 variables)

The following environment variables have been automatically set up:

1. **JWT_SECRET_KEY** - Secure random key for JWT tokens
2. **JWT_ALGORITHM** - HS256
3. **ACCESS_TOKEN_EXPIRE_MINUTES** - 30 minutes
4. **CORS_ORIGINS** - https://hackathon-phase2-todo-nine.vercel.app
5. **FRONTEND_URL** - https://hackathon-phase2-todo-nine.vercel.app
6. **NEXT_PUBLIC_API_URL** - https://hackathon-phase2-todo-nine.vercel.app
7. **NEXT_PUBLIC_APP_NAME** - Todo Application
8. **BETTER_AUTH_SECRET** - Secure random key for Better Auth
9. **AUTH_URL** - https://hackathon-phase2-todo-nine.vercel.app
10. **PASSWORD_RESET_TOKEN_EXPIRY_MINUTES** - 15 minutes
11. **PASSWORD_RESET_MAX_REQUESTS_PER_HOUR** - 3 requests
12. **SMTP_HOST** - smtp.gmail.com
13. **SMTP_PORT** - 587
14. **SMTP_USE_TLS** - true
15. **EMAIL_FROM_NAME** - Todo Application

---

## ⚠️ Manual Configuration Required

You need to manually add these environment variables in Vercel Dashboard:

### 1. DATABASE_URL (Required)
**Purpose:** PostgreSQL database connection string

**Options:**
- **Vercel Postgres** (Recommended): https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com/
- **Neon**: https://neon.tech/
- **Railway**: https://railway.app/

**How to add:**
```bash
vercel env add DATABASE_URL production
# Then paste your PostgreSQL connection string
# Example: postgresql://user:password@host:5432/database
```

**For testing (SQLite - not recommended for production):**
```bash
echo "sqlite:///./todo.db" | vercel env add DATABASE_URL production
```

---

### 2. COHERE_API_KEY (Required for AI features)
**Purpose:** AI-powered task suggestions and enhancements

**How to get:**
1. Go to https://dashboard.cohere.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Copy your API key

**How to add:**
```bash
vercel env add COHERE_API_KEY production
# Then paste your Cohere API key
```

---

### 3. Email Configuration (Required for password reset)

#### SMTP_USERNAME
Your Gmail address or SMTP username

```bash
vercel env add SMTP_USERNAME production
# Enter: your_email@gmail.com
```

#### SMTP_PASSWORD
Gmail App-Specific Password (NOT your regular Gmail password)

**How to get Gmail App Password:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Copy the 16-character password

```bash
vercel env add SMTP_PASSWORD production
# Paste the 16-character app password
```

#### EMAIL_FROM
The email address that will appear as sender

```bash
vercel env add EMAIL_FROM production
# Enter: your_email@gmail.com
```

---

## 🚀 After Adding Variables

Once you've added all required variables, redeploy:

```bash
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard:
https://vercel.com/abdul-rehmans-projects-80ec3c02/hackathon-phase2-todo

---

## 📋 Quick Setup Commands

Copy and run these commands one by one:

```bash
# 1. Add Database URL (choose your provider)
vercel env add DATABASE_URL production

# 2. Add Cohere API Key
vercel env add COHERE_API_KEY production

# 3. Add Email Configuration
vercel env add SMTP_USERNAME production
vercel env add SMTP_PASSWORD production
vercel env add EMAIL_FROM production

# 4. Redeploy
vercel --prod
```

---

## 🔍 Verify Environment Variables

Check all configured variables:
```bash
vercel env ls
```

Pull environment variables to local:
```bash
vercel env pull
```

---

## 🌐 Your Deployment URLs

- **Production:** https://hackathon-phase2-todo-nine.vercel.app
- **Dashboard:** https://vercel.com/abdul-rehmans-projects-80ec3c02/hackathon-phase2-todo

---

## 📝 Notes

- Environment variables are encrypted in Vercel
- Changes require redeployment to take effect
- Use Vercel Dashboard for easier management: Settings → Environment Variables
- For development, create `.env.local` files locally
