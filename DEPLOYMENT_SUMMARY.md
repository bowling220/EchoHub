# 🚀 EchoHub Deployment Setup - Complete Guide

## ✅ What's Been Done

### 1. Configuration Files Created
- ✅ `render.yaml` - Render deployment configuration (Blueprint)
- ✅ `DEPLOYMENT.md` - Detailed deployment instructions
- ✅ `server/.env.example` - Server environment template
- ✅ `client/.env` - Client environment variables
- ✅ `client/.env.example` - Client environment template
- ✅ `.gitignore` - Root gitignore file

### 2. Server Configuration
- ✅ Updated `server/server.js` with:
  - Environment-based CORS configuration
  - JWT secret validation
  - Health check endpoint (`/api/auth/health`)
  - Production-ready settings

### 3. Client Configuration
- ✅ Created `client/src/config.js` - Centralized API configuration
- ✅ Created `client/src/api.js` - Axios instance with interceptors
- ✅ Updated `client/vite.config.js` - Environment-based build config

### 4. Files Already Updated with Config
- ✅ `client/src/App.jsx`
- ✅ `client/src/pages/Messages.jsx`
- ✅ `client/src/context/AuthContext.jsx`

## ⚠️ IMPORTANT: Remaining Tasks

### Task 1: Update Remaining Client Files

The following files still have hardcoded `http://localhost:3001` URLs that need to be updated:

#### Files to Update:
1. `client/src/pages/Feed.jsx`
2. `client/src/pages/Profile.jsx`
3. `client/src/pages/Settings.jsx`
4. `client/src/pages/Notifications.jsx`
5. `client/src/pages/Admin.jsx`
6. `client/src/pages/PostDetail.jsx`
7. `client/src/components/PostCard.jsx`
8. `client/src/components/RightBar.jsx`

#### How to Update Each File:

**Step 1:** Add the import at the top (after other imports):
```javascript
import config from '../config';  // For pages
// OR
import config from '../../config';  // For components in subdirectories
```

**Step 2:** Replace all instances of:
```javascript
// FROM:
axios.get('http://localhost:3001/api/...')
axios.post('http://localhost:3001/api/...')

// TO:
axios.get(`${config.apiUrl}/api/...`)
axios.post(`${config.apiUrl}/api/...`)
```

**Example:**
```javascript
// BEFORE:
const res = await axios.get('http://localhost:3001/api/posts');

// AFTER:
const res = await axios.get(`${config.apiUrl}/api/posts`);
```

### Task 2: Test Locally

After updating all files, test the application locally:

```bash
# Terminal 1 - Start server
cd server
npm start

# Terminal 2 - Start client
cd client
npm run dev
```

Verify:
- ✅ Login/Register works
- ✅ Posts load correctly
- ✅ Messages work
- ✅ Notifications appear
- ✅ All features function normally

### Task 3: Prepare for Deployment

#### 3.1 Initialize Git Repository (if not already done)

```bash
# In the EchoHub root directory
git init
git add .
git commit -m "Initial commit - EchoHub ready for deployment"
```

#### 3.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `echohub`
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

#### 3.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/echohub.git
git branch -M main
git push -u origin main
```

### Task 4: Deploy to Render

#### Option A: Using Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Select the `echohub` repository
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**
7. Wait for both services to deploy (5-10 minutes)

#### Option B: Manual Deployment

Follow the detailed instructions in `DEPLOYMENT.md`

### Task 5: Configure Environment Variables

After deployment, you need to set these environment variables in Render:

#### Backend Service (`echohub-api`):
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `JWT_SECRET` = (Generate a secure random string)
- `CLIENT_URL` = (Your frontend URL from Render)

#### Frontend Service (`echohub-client`):
- `VITE_API_URL` = (Your backend URL from Render)

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] All client files updated with `config` imports
- [ ] Local testing completed successfully
- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] `.env` files NOT committed (check `.gitignore`)
- [ ] Database considerations addressed (see below)

## 🗄️ Database Considerations

⚠️ **IMPORTANT**: SQLite on Render's free tier is ephemeral (data lost on restart)

### Options:

#### Option 1: Keep SQLite (Testing Only)
- Good for: Initial testing
- Limitation: Data resets on service restart
- Setup: No changes needed

#### Option 2: Migrate to PostgreSQL (Recommended for Production)
1. Create PostgreSQL database in Render
2. Install `pg` package: `npm install pg`
3. Update database connection in `server/db.js`
4. Update `DATABASE_URL` environment variable

## 🔧 Troubleshooting

### Common Issues:

**1. CORS Errors**
- Verify `CLIENT_URL` in backend matches frontend URL exactly
- Check both services are deployed and running

**2. API Connection Errors**
- Verify `VITE_API_URL` in frontend matches backend URL
- Check backend service is running (visit `/api/auth/health`)

**3. Build Failures**
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure Node version compatibility

**4. Environment Variables Not Working**
- Redeploy after changing environment variables
- Check spelling and formatting

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

## 🎯 Next Steps

1. **Complete Task 1**: Update remaining client files
2. **Complete Task 2**: Test locally
3. **Complete Task 3**: Push to GitHub
4. **Complete Task 4**: Deploy to Render
5. **Complete Task 5**: Configure environment variables
6. **Test Production**: Visit your live URL and test all features

---

## Quick Command Reference

```bash
# Local Development
npm run dev                    # Start both client and server

# Build for Production
cd client && npm run build     # Build client
cd server && npm start         # Start server in production

# Git Commands
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit changes
git push origin main           # Push to GitHub

# Environment Variables
# Edit in Render Dashboard → Service → Environment tab
```

---

**Your EchoHub is almost ready to go live! 🚀**

Just complete the remaining tasks above and you'll have a fully deployed, public website!
