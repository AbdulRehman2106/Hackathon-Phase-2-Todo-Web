# 🔧 Backend Troubleshooting Guide

## ❌ Current Issue: 500 Internal Server Error on Signup

### Error Details:
- **Endpoint**: `/api/auth/signup`
- **Status Code**: 500 Internal Server Error
- **Backend URL**: https://abdul18-todo-web.hf.space

### ✅ What's Working:
- Health endpoint: `/health` returns `{"status":"healthy"}`
- Root endpoint: `/` returns API information
- API docs: `/docs` is accessible

### ❌ What's Not Working:
- User signup endpoint returns 500 error

---

## 🔍 Step 1: Check Hugging Face Space Logs

**IMPORTANT**: Yeh sabse pehla step hai!

1. Go to: https://huggingface.co/spaces/Abdul18/Todo-Web
2. Click on "Logs" tab (top right)
3. Look for error messages when you try to signup
4. Common errors to look for:
   - `OperationalError: no such table: user`
   - `ValueError: Invalid salt`
   - `KeyError: 'JWT_SECRET_KEY'`
   - `ModuleNotFoundError: No module named 'passlib'`

---

## 🛠️ Step 2: Verify Environment Variables

Go to your Hugging Face Space settings and ensure these variables are set:

### Required Variables:

```bash
# Database Configuration
DATABASE_URL=sqlite:////tmp/todo.db

# JWT Configuration
JWT_SECRET_KEY=your-secure-random-key-here
JWT_ALGORITHM=HS256

# CORS Configuration
CORS_ORIGINS=https://frontend-rose-iota-29.vercel.app,https://frontend-b37yszlp4-abdul-rehmans-projects-80ec3c02.vercel.app
```

### How to Set Variables on Hugging Face:

1. Go to: https://huggingface.co/spaces/Abdul18/Todo-Web/settings
2. Scroll to "Repository secrets"
3. Add each variable as a secret
4. Restart the Space after adding variables

---

## 🔧 Step 3: Common Issues & Solutions

### Issue 1: Database Tables Not Created

**Symptoms**: Error like `no such table: user`

**Solution**:
The backend should auto-create tables on startup. Check if `create_db_and_tables()` is being called in `main.py`.

**Fix**: Restart the Hugging Face Space to trigger database initialization.

### Issue 2: Password Hashing Library Issue

**Symptoms**: Error like `ValueError: Invalid salt` or bcrypt errors

**Solution**:
Check if `passlib` and `bcrypt` are properly installed.

**Fix**: Verify `requirements.txt` includes:
```
passlib[bcrypt]>=1.7.4
bcrypt>=4.0.1
```

### Issue 3: Missing JWT Secret Key

**Symptoms**: Error like `KeyError: 'JWT_SECRET_KEY'`

**Solution**:
JWT_SECRET_KEY environment variable is not set.

**Fix**: Add JWT_SECRET_KEY to Hugging Face Space secrets.

### Issue 4: SQLite Permission Issues

**Symptoms**: Error like `OperationalError: unable to open database file`

**Solution**:
SQLite can't write to the specified path.

**Fix**: Use `/tmp/todo.db` path which is writable on Hugging Face Spaces:
```bash
DATABASE_URL=sqlite:////tmp/todo.db
```

---

## 🧪 Step 4: Test Backend Directly

### Test 1: Health Check
```bash
curl https://abdul18-todo-web.hf.space/health
```
Expected: `{"status":"healthy"}`

### Test 2: API Documentation
Visit: https://abdul18-todo-web.hf.space/docs

Try the signup endpoint directly from Swagger UI.

### Test 3: Direct Signup Test
```bash
curl -X POST https://abdul18-todo-web.hf.space/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

---

## 📋 Quick Fix Checklist

- [ ] Check Hugging Face Space logs for actual error
- [ ] Verify all environment variables are set
- [ ] Restart Hugging Face Space
- [ ] Test signup endpoint from Swagger UI
- [ ] Check if database tables are created
- [ ] Verify bcrypt/passlib are installed
- [ ] Test with a simple curl command

---

## 🔄 If Still Not Working

### Option 1: Redeploy Backend

1. Make sure all environment variables are set
2. Go to Hugging Face Space settings
3. Click "Factory reboot" to restart from scratch
4. Wait for Space to rebuild
5. Test again

### Option 2: Check Backend Code

Verify these files on Hugging Face:
- `src/main.py` - Database initialization
- `src/services/auth.py` - Password hashing
- `src/database.py` - Database connection
- `requirements.txt` - Dependencies

### Option 3: Use Alternative Database

If SQLite continues to have issues, consider using:
- **Supabase** (PostgreSQL) - Free tier available
- **Neon** (PostgreSQL) - Serverless PostgreSQL
- **MongoDB Atlas** - NoSQL option

---

## 📞 Next Steps

1. **Check logs first** - This will tell you the exact error
2. **Set environment variables** - Most common issue
3. **Restart Space** - Often fixes initialization issues
4. **Test endpoints** - Verify each step works

Once you identify the specific error from logs, we can provide a targeted fix.

---

## 🆘 Getting Help

If you're still stuck:

1. Copy the error message from Hugging Face logs
2. Share the error here
3. We'll provide a specific solution

**Common Error Patterns:**

- `no such table` → Database not initialized
- `Invalid salt` → Password hashing issue
- `KeyError` → Missing environment variable
- `Connection refused` → Database connection issue
- `Module not found` → Missing dependency
