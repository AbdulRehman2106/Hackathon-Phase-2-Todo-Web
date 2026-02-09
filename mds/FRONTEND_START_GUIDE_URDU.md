# Frontend Ko Fresh Start Karne Ka Complete Guide

## Problem: Localhost:3000 pe purana data ya error aa raha hai

## Solution: Step-by-Step

### Step 1: Dono Servers Ko Properly Start Karein

#### Backend Start Karein (Terminal 1)
```bash
cd backend
python -m uvicorn src.main:app --reload --port 8080
```

**Check karein**: http://localhost:8080/health
**Expected**: `{"status":"healthy"}`

#### Frontend Start Karein (Terminal 2)
```bash
cd frontend
npm run dev
```

**Wait karein**: "Ready on http://localhost:3000" message ke liye

### Step 2: Browser Cache Clear Karein

**Sabse Important!**

1. Browser mein `Ctrl + Shift + Delete` press karein
2. "Cached images and files" select karein
3. "Clear data" click karein

**Ya phir:**
- `Ctrl + Shift + R` (Hard Refresh)
- `Ctrl + F5` (Force Reload)

### Step 3: Fresh Page Open Karein

1. Browser completely close karein
2. Phir se open karein
3. http://localhost:3000 type karein

### Step 4: Login Karein

1. Sign-in page pe jaayein
2. **Email**: testuser999@example.com
3. **Password**: TestPassword123!
4. Login button click karein

---

## Agar Frontend Start Nahi Ho Raha

### Option 1: Port Already In Use
```bash
# Windows mein port 3000 ko free karein
netstat -ano | findstr :3000
# PID note karein, phir:
taskkill /PID <PID_NUMBER> /F

# Phir frontend start karein
cd frontend
npm run dev
```

### Option 2: Different Port Use Karein
```bash
cd frontend
set PORT=3001 && npm run dev
```
Phir http://localhost:3001 open karein

### Option 3: Node Modules Reinstall
```bash
cd frontend
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

## Incognito Mode (Sabse Aasan!)

**Agar cache clear karne mein problem ho:**

1. `Ctrl + Shift + N` (Chrome)
2. `Ctrl + Shift + P` (Edge)
3. Incognito window mein http://localhost:3000 open karein
4. Login karein

Incognito mode mein cache nahi hota, fresh data dikhega!

---

## Check Karein Ki Sab Kuch Sahi Hai

### Backend Check:
```bash
curl http://localhost:8080/health
```
✅ Response: `{"status":"healthy"}`

### Frontend Check:
```bash
curl http://localhost:3000
```
✅ Response: HTML page (not "Internal Server Error")

### Login Check:
1. http://localhost:3000/sign-in open karein
2. Login karein
3. Dashboard dikhna chahiye

---

## Fresh Data Dikhne Ke Baad

Dashboard pe aapko dikhega:
- ✅ Aapke tasks
- ✅ Create new task button
- ✅ Task stats
- ✅ Sign out option
- ✅ Updated UI

---

## Common Issues & Solutions

### Issue 1: "Internal Server Error"
**Solution**: Frontend restart karein
```bash
# Terminal mein Ctrl + C
cd frontend
npm run dev
```

### Issue 2: "Cannot connect to backend"
**Solution**: Backend check karein
```bash
cd backend
python -m uvicorn src.main:app --reload --port 8080
```

### Issue 3: "Old data still showing"
**Solution**:
1. Browser cache clear karein (Ctrl + Shift + Delete)
2. Hard refresh karein (Ctrl + Shift + R)
3. Incognito mode use karein

### Issue 4: "Port 3000 already in use"
**Solution**: Port free karein ya different port use karein
```bash
set PORT=3001 && npm run dev
```

---

## Test Account

**Email**: testuser999@example.com
**Password**: TestPassword123!

---

## Final Checklist

- [ ] Backend running hai? (port 8080)
- [ ] Frontend running hai? (port 3000)
- [ ] Browser cache clear kiya?
- [ ] Hard refresh kiya? (Ctrl + Shift + R)
- [ ] Login credentials sahi hain?
- [ ] Dashboard pe fresh data dikh raha hai?

---

## Agar Abhi Bhi Problem Ho

Mujhe batayein:
1. Kaunsa error message dikh raha hai?
2. Terminal mein kya output aa raha hai?
3. Browser console mein koi error hai? (F12 press karke check karein)

Main turant help karunga! 🚀

---

**Pro Tip**: Hamesha Incognito mode use karein testing ke liye - cache issues nahi honge!
