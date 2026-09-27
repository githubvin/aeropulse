# AeroPulse BRICS: Cloud Deployment Guide

This guide explains how to deploy **AeroPulse BRICS** online for free using **Render**, **Vercel**, or **Google Cloud Run**.

---

## 🌟 Recommendation Summary

| Platform | Best For | Free Tier? | Deployment Time |
|---|---|---|---|
| **Option A: Render (Blueprint)** | **Easiest Full-Stack Setup** (deploys both Backend & Frontend together) | ✅ Free | ~3 minutes |
| **Option B: Vercel + Render** | **Fastest Frontend CDN** (Vercel for React, Render for Python API) | ✅ Free | ~4 minutes |
| **Option C: Google Cloud Run** | **Maximum Hackathon Impact** (matches Google Cloud sponsor) | ✅ Free tier (2M requests/mo) | ~5 minutes |

---

## Option A: Deploy on Render (Easiest - 1-Click Blueprint)

We have already included a [`render.yaml`](../render.yaml) file in the repository that configures both the Python FastAPI backend and the React frontend automatically.

### Steps:
1. Go to **[dashboard.render.com](https://dashboard.render.com)** and sign in with your GitHub account.
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your repository: **`githubvin/aeropulse`**.
4. Render will read `render.yaml` and show:
   - `aeropulse-backend` (Web Service, Python)
   - `aeropulse-frontend` (Static Site, React)
5. *(Optional)*: In the Environment Variables section for `aeropulse-backend`, you can add `GOOGLE_API_KEY` (if you want live Gemini API calls, though the app works even without it using the built-in fallback).
6. Click **Apply**.
7. In ~3 minutes, your frontend will be live at:  
   `https://aeropulse-frontend.onrender.com`

---

## Option B: Deploy on Vercel (Frontend) + Render (Backend)

If you love Vercel's ultra-fast edge network:

### Step 1: Deploy Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com) ➔ **New +** ➔ **Web Service**.
2. Connect `githubvin/aeropulse`.
3. Fill in the settings:
   - **Name**: `aeropulse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
4. Click **Create Web Service**. Note your backend URL (e.g. `https://aeropulse-backend.onrender.com`).

### Step 2: Deploy Frontend on Vercel
1. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** ➔ **Project** ➔ Import **`githubvin/aeropulse`**.
3. Under **Project Settings**:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite` (automatically detected).
4. *(The included `frontend/vercel.json` automatically proxies `/api/*` to the backend!)*
5. Click **Deploy**. Your app will be live at `https://aeropulse.vercel.app`!

---

## Option C: Deploy on Google Cloud Run (Recommended for Judges!)

Because this hackathon is sponsored by **Google Cloud & GDG India**, deploying on Google Cloud demonstrates native cloud fluency. We have provided a multi-stage [`Dockerfile`](../Dockerfile) that bundles the React frontend and Python backend into a single container.

### Prerequisites:
- A free Google Cloud account (with free trial credits).
- The Google Cloud CLI (`gcloud`) installed.

### Steps:
1. Open your terminal in the project directory:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. Deploy directly from source:
   ```bash
   gcloud run deploy aeropulse --source . --platform managed --region us-central1 --allow-unauthenticated
   ```
3. Cloud Build will package the container and provide your live HTTPS URL:
   `https://aeropulse-xxxxxx-uc.a.run.app`
