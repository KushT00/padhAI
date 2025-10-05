# Backend Deployment Guide

## 🚨 Current Issue

Your frontend is deployed on Vercel: `https://padh-ai-pro.vercel.app`
But your backend is running locally: `http://localhost:8000`

**Result**: CORS errors - frontend can't reach backend!

## ✅ Solution: Deploy Backend to Railway (Free & Easy)

### **Step 1: Prepare for Deployment**

Create a `Procfile` in your project root:

```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

Create `runtime.txt` (optional):
```
python-3.11
```

### **Step 2: Deploy to Railway**

1. **Sign Up**: https://railway.app/
2. **New Project** → **Deploy from GitHub**
3. **Connect** your GitHub account
4. **Select** your repository
5. **Configure**:
   - Root Directory: `/` (or where server.py is)
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### **Step 3: Add Environment Variables**

In Railway dashboard, add these:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret
GOOGLE_API_KEY=your-google-api-key
GROQ_API_KEY=your-groq-api-key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
LANGCHAIN_PROJECT=PadhAI-RAG
```

### **Step 4: Deploy**

Click **Deploy** - Railway will:
1. Install dependencies
2. Start your server
3. Give you a public URL: `https://your-app.up.railway.app`

### **Step 5: Update Frontend**

Update your Vercel environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

Redeploy Vercel (it will auto-redeploy on git push).

---

## 🎯 Alternative: Deploy to Render

### **Step 1: Sign Up**

Go to: https://render.com/

### **Step 2: New Web Service**

1. Click **New** → **Web Service**
2. Connect GitHub repo
3. Configure:
   - **Name**: padhai-backend
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### **Step 3: Environment Variables**

Add all your `.env` variables in Render dashboard.

### **Step 4: Deploy**

Render will give you: `https://padhai-backend.onrender.com`

---

## 🔧 Alternative: Use Ngrok (Temporary Testing)

For quick testing without deploying:

1. **Install ngrok**: https://ngrok.com/download
2. **Run your backend**: `python -m uvicorn server:app --port 8000`
3. **Expose it**: `ngrok http 8000`
4. **Copy URL**: `https://abc123.ngrok.io`
5. **Update Vercel env**: `NEXT_PUBLIC_API_URL=https://abc123.ngrok.io`

⚠️ **Note**: Ngrok URLs change on restart. Not for production!

---

## 📋 Deployment Checklist

### **Before Deploying:**
- [ ] All environment variables documented
- [ ] requirements.txt up to date
- [ ] CORS configured for production domain
- [ ] Database migrations ready (if any)
- [ ] Test locally one more time

### **After Deploying:**
- [ ] Backend URL is accessible
- [ ] Health check works: `https://your-backend.com/`
- [ ] Update frontend `NEXT_PUBLIC_API_URL`
- [ ] Test folder indexing
- [ ] Test chat functionality
- [ ] Check LangSmith traces
- [ ] Monitor error logs

---

## 🎨 Production Architecture

```
User Browser
    ↓
Vercel (Frontend)
https://padh-ai-pro.vercel.app
    ↓
Railway/Render (Backend)
https://your-app.railway.app
    ↓
├─ Supabase (Storage + Auth)
├─ Google AI (Embeddings)
└─ Groq (LLM)
```

---

## 🔍 Troubleshooting

### **CORS Errors**

Update `server.py`:
```python
allow_origins=[
    "https://padh-ai-pro.vercel.app",
    "https://*.vercel.app"
]
```

### **Environment Variables Not Working**

Check Railway/Render dashboard - make sure all variables are set.

### **Backend Not Starting**

Check logs in Railway/Render dashboard:
- Missing dependencies?
- Wrong Python version?
- Port binding issues?

### **Slow Cold Starts**

Free tiers sleep after inactivity:
- Railway: 5 min sleep
- Render: 15 min sleep
- Solution: Upgrade to paid tier or use keep-alive pings

---

## 💰 Cost Estimates

### **Free Tier Limits:**

**Railway:**
- $5 free credit/month
- ~500 hours runtime
- Enough for development

**Render:**
- Free tier available
- Sleeps after 15 min inactivity
- 750 hours/month

**Recommended for Production:**
- Railway Pro: $5/month
- Render Starter: $7/month

### **API Costs:**

**Groq:**
- Free tier: 30 requests/min
- Very cheap: ~$0.10 per 1M tokens

**Google Gemini:**
- Free tier: 60 requests/min
- Embeddings: Very cheap

**Estimated Total:**
- Development: **$0-5/month**
- Production (100 users): **$10-20/month**

---

## 🚀 Quick Start (Railway)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Add environment variables
railway variables set GOOGLE_API_KEY=your-key
railway variables set GROQ_API_KEY=your-key
# ... add all variables

# 5. Deploy
railway up

# 6. Get URL
railway domain
```

---

## 📊 Monitoring Production

### **Railway Dashboard:**
- View logs in real-time
- Monitor CPU/memory usage
- Track deployments
- Set up alerts

### **LangSmith:**
- Track all LLM calls
- Monitor costs
- Debug issues
- Analyze performance

### **Vercel Analytics:**
- Frontend performance
- User analytics
- Error tracking

---

## 🎯 Next Steps

1. **Deploy backend** to Railway/Render
2. **Update frontend** env variable
3. **Test production** thoroughly
4. **Set up monitoring** (LangSmith, Sentry)
5. **Configure custom domain** (optional)
6. **Set up CI/CD** (auto-deploy on git push)

---

**Your app will be fully live once backend is deployed!** 🚀
