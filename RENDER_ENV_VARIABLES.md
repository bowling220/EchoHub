# Environment Variables for Render Deployment

## 🔧 Backend Service (echohub-api)

When setting up your backend web service on Render, add these environment variables:

### Required Variables:

```
NODE_ENV=production
```

```
PORT=10000
```

```
JWT_SECRET=
```
**👆 Click "Generate" button in Render to create a secure random value**

```
CLIENT_URL=
```
**👆 Add your frontend URL after deploying the frontend (e.g., https://echohub.onrender.com)**

### Optional (Database):

```
DATABASE_URL=file:./echohub.db
```
**Note:** SQLite data is lost on restart. Consider PostgreSQL for production.

---

## 🎨 Frontend Static Site (echohub-client)

When setting up your frontend static site on Render, add this environment variable:

### Required Variable:

```
VITE_API_URL=
```
**👆 Add your backend URL after deploying the backend (e.g., https://echohub-api.onrender.com)**

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Deploy Backend First

1. Create Web Service on Render
2. Add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `JWT_SECRET` = Click "Generate"
   - `CLIENT_URL` = Leave blank for now
3. Deploy and copy the URL (e.g., `https://echohub-api.onrender.com`)

### Step 2: Deploy Frontend

1. Create Static Site on Render
2. Add environment variable:
   - `VITE_API_URL` = Your backend URL from Step 1
3. Deploy and copy the URL (e.g., `https://echohub.onrender.com`)

### Step 3: Update Backend

1. Go back to backend service
2. Update `CLIENT_URL` = Your frontend URL from Step 2
3. Save (will trigger redeploy)

---

## 🏠 Local Development .env Files

### Server (.env)
```bash
# Database Configuration
DATABASE_URL="file:./echohub.db"

# Server Configuration
NODE_ENV=development
PORT=3001
JWT_SECRET=dev-secret-key-change-in-production-12345
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```bash
# Client Environment Variables (Local Development)
# API URL for backend
VITE_API_URL=http://localhost:3001
```

---

## ⚠️ Important Notes

1. **Never commit `.env` files to Git** - They're already in `.gitignore`
2. **JWT_SECRET** must be different in production (use Render's "Generate" button)
3. **URLs must match exactly** - No trailing slashes
4. **After changing environment variables** in Render, the service will automatically redeploy

---

## 🔐 Security Checklist

- [ ] JWT_SECRET is randomly generated in production
- [ ] .env files are not committed to Git
- [ ] CLIENT_URL matches your actual frontend URL
- [ ] VITE_API_URL matches your actual backend URL
- [ ] NODE_ENV is set to "production" on Render

---

## 🐛 Troubleshooting

**CORS Errors?**
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Check both services are deployed and running

**API Connection Errors?**
- Verify `VITE_API_URL` in frontend matches backend URL
- Test backend health: `https://your-backend-url.onrender.com/api/auth/health`

**Authentication Not Working?**
- Check `JWT_SECRET` is set in production
- Verify it's the same secret being used consistently

---

**Ready to deploy? Follow the step-by-step guide above!** 🚀
