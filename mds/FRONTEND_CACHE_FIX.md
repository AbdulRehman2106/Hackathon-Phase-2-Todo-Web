# Frontend Cache Clear Karne Ke Steps

## Problem: Localhost:3000 pe purana data dikh raha hai

## Solution:

### Step 1: Frontend Cache Clear Karein
```bash
cd frontend
rm -rf .next
rm -rf node_modules/.cache
```

### Step 2: Browser Cache Clear Karein

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. "Cached images and files" select karein
3. "Clear data" click karein

**Ya phir:**
1. Browser mein `Ctrl + Shift + R` press karein (Hard Refresh)
2. Ya `Ctrl + F5` press karein

### Step 3: Frontend Restart Karein
```bash
cd frontend
npm run dev
```

### Step 4: Browser Mein Fresh Open Karein
1. Browser completely close karein
2. Phir se open karein
3. http://localhost:3000 pe jaayein

---

## Agar Abhi Bhi Problem Ho

### Option 1: Incognito/Private Mode Use Karein
- Chrome: `Ctrl + Shift + N`
- Edge: `Ctrl + Shift + P`
- Phir http://localhost:3000 open karein

### Option 2: Different Port Use Karein
```bash
cd frontend
PORT=3001 npm run dev
```
Phir http://localhost:3001 pe jaayein

### Option 3: Complete Fresh Start
```bash
# Frontend stop karein (Ctrl + C)
cd frontend
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

---

## Check Karein Ki Sahi Data Aa Raha Hai

1. http://localhost:3000/sign-in pe jaayein
2. Login karein:
   - Email: testuser999@example.com
   - Password: TestPassword123!
3. Dashboard pe aapko fresh data dikhna chahiye

---

## Backend Check Karein

Backend running hai ya nahi:
```bash
curl http://localhost:8080/health
```

Response aana chahiye:
```json
{"status":"healthy"}
```

---

## Agar Abhi Bhi Issue Ho To

1. Dono servers stop karein (Ctrl + C)
2. Backend start karein:
   ```bash
   cd backend
   python -m uvicorn src.main:app --reload --port 8080
   ```
3. Frontend start karein (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
4. Browser cache clear karein
5. Fresh page load karein

---

**Tip**: Hamesha `Ctrl + Shift + R` use karein fresh data ke liye!
