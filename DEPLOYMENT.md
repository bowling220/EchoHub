# EchoHub Deployment Guide - Render

This guide will help you deploy your EchoHub application to Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Git installed on your local machine

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - EchoHub ready for deployment"
   ```

2. **Create a GitHub repository** and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/echohub.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Blueprint - Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Click **"Apply"** to create both services

### Option B: Manual Setup

#### Deploy Backend (API Server)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Name**: `echohub-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render default)
   - `JWT_SECRET` = Generate a secure random string (click "Generate")
   - `CLIENT_URL` = (Leave blank for now, will add after frontend deployment)

6. Click **"Create Web Service"**
7. **Copy the service URL** (e.g., `https://echohub-api.onrender.com`)

#### Deploy Frontend (Client)

1. Click **"New +"** → **"Static Site"**
2. Connect your repository
3. Configure:
   - **Name**: `echohub-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. **Add Environment Variables**:
   - `VITE_API_URL` = Your backend URL from step 7 above (e.g., `https://echohub-api.onrender.com`)

5. Click **"Create Static Site"**
6. **Copy the frontend URL** (e.g., `https://echohub.onrender.com`)

#### Update Backend Environment

1. Go back to your **echohub-api** service
2. Go to **Environment** tab
3. Update `CLIENT_URL` with your frontend URL from step 6
4. Click **"Save Changes"** (this will redeploy)

## Step 3: Database Considerations

⚠️ **Important**: SQLite databases on Render's free tier are **ephemeral** (data is lost on restart).

### For Production, Choose One:

#### Option 1: Keep SQLite (Testing Only)
- Data will be lost when the service restarts
- Good for testing the deployment
- No additional setup needed

#### Option 2: Upgrade to PostgreSQL (Recommended)
1. In Render Dashboard, create a **PostgreSQL** database
2. Update your server code to use PostgreSQL instead of SQLite
3. Install `pg` package: `npm install pg`
4. Update connection string in environment variables

## Step 4: Verify Deployment

1. Visit your frontend URL (e.g., `https://echohub.onrender.com`)
2. Test registration and login
3. Check that all features work correctly

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month of runtime (enough for one service 24/7)

### Environment Variables
- Never commit `.env` files to Git
- Always use Render's environment variable settings
- JWT_SECRET should be a strong random string in production

### Troubleshooting

**Service won't start?**
- Check the logs in Render Dashboard
- Verify all environment variables are set
- Ensure build commands are correct

**CORS errors?**
- Verify CLIENT_URL matches your frontend URL exactly
- Check that both services are deployed

**Database errors?**
- Ensure database file path is correct
- Consider migrating to PostgreSQL for production

## Updating Your Deployment

When you push changes to your repository:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect the changes and redeploy both services.

## Custom Domain (Optional)

1. In your static site settings, go to **"Custom Domains"**
2. Add your domain
3. Update DNS records as instructed
4. Update `CLIENT_URL` in backend environment variables

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

---

**Your EchoHub is now live! 🚀**
