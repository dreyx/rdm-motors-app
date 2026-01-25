# RDM Motors - FREE Deployment Guide

## Overview
This guide shows you how to publish your dealership website **100% FREE** using GitHub + Vercel.

---

## Step 1: Create a GitHub Repository (If you don't have one)

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click the **+** button → **New repository**
3. Name it `rdm-motors` (or anything you like)
4. Click **Create repository**

---

## Step 2: Push Your Code to GitHub

Open a terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit - RDM Motors dealer site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rdm-motors.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 3: Deploy to Vercel (FREE)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New** → **Project**
3. Select your `rdm-motors` repository
4. Click **Deploy**
5. Wait 1-2 minutes, and your site is LIVE!

---

## Managing Inventory (The Simple Way)

### Adding/Editing Vehicles:
1. Run your site locally: `npm run dev`
2. Go to `http://localhost:3000/admin/login`
3. Enter your password and manage vehicles
4. When done, push changes to GitHub:
   ```bash
   git add .
   git commit -m "Updated inventory"
   git push
   ```
5. Vercel automatically redeploys (takes ~1 minute)

---

## Your Site URLs

After deployment:
- **Live Site**: `https://rdm-motors.vercel.app` (or custom domain)
- **Admin**: Only accessible locally for security

---

## Security Notes

✅ **XSS Protected**: React escapes all user input by default
✅ **Injection Protected**: No database means no SQL injection possible
✅ **Admin Protected**: Only accessible on your local computer
✅ **HTTPS**: Vercel provides free SSL certificates

---

## Cost Summary

| Service | Cost |
|---------|------|
| GitHub | FREE |
| Vercel | FREE |
| Domain (optional) | ~$12/year |
| **Total** | **$0-12/year** |

---

## Need Help?

If you want to update inventory from your phone (without a computer), we'd need to add a simple login system. Let me know if you want that feature!
