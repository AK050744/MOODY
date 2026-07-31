# MoodEnhancer Backend

> AI-powered mental wellness platform for youth — Node.js + Express + MongoDB + OpenAI

---

## What this backend does

Every request through this system touches someone who needed someone to talk to. The backend powers:

- **Crisis detection** on every mood entry, chat message, and journal entry
- **AI mood analysis** using GPT-4o-mini
- **Personalized recommendations** enriched with real Spotify/TMDB/YouTube data
- **Mia** — the AI companion chatbot who remembers your story
- **90-day mood memory** that builds a picture of each user over time
- **Anonymous peer community** with safety moderation baked in
- **Weekly AI wellness reports** sent to every user

---

## Folder structure

```
src/
├── index.js                  # Entry point
├── app.js                    # Express setup, routes, middleware
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js               # User + AI memory + preferences
│   ├── MoodEntry.js          # Mood check-ins + crisis detection results
│   ├── Journal.js            # Daily journal entries
│   ├── Recommendation.js     # Content recommendations + feedback
│   ├── ChatMessage.js        # Mia chatbot history
│   └── CommunityPost.js      # Anonymous peer posts
├── controllers/
│   ├── authController.js     # Signup, login, JWT
│   ├── moodController.js     # Check-in flow (analysis → crisis → recommendations)
│   ├── chatController.js     # Mia AI companion
│   ├── journalController.js  # Daily journal + AI reflection
│   ├── recommendationController.js
│   ├── analyticsController.js # Dashboard, weekly report, burnout prediction
│   └── communityController.js # Anonymous peer support
├── services/
│   ├── crisisService.js      # ⚠️  Most important — crisis detection
│   ├── openaiService.js      # All AI interactions
│   └── externalApiService.js # Spotify, TMDB, YouTube
├── routes/                   # Express routers
├── middleware/
│   ├── authMiddleware.js     # JWT protect + role guard
│   └── errorMiddleware.js    # Global error handling
└── utils/
    └── logger.js             # Winston logger
```

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set environment variables
```bash
cp .env.example .env
# Edit .env with your real API keys
```

### 3. Get your API keys

| Service | Where to get it | Cost |
|---------|----------------|------|
| MongoDB Atlas | cloud.mongodb.com | Free tier available |
| OpenAI | platform.openai.com/api-keys | ~$0.002/request with gpt-4o-mini |
| Spotify | developer.spotify.com/dashboard | Free |
| TMDB | themoviedb.org/settings/api | Free |
| YouTube Data v3 | console.cloud.google.com | 10,000 free requests/day |

### 4. Run in development
```bash
npm run dev
```

### 5. Health check
```
GET http://localhost:5000/health
```

---

## API Reference

### Auth
```
POST /api/auth/signup        { name, email, password, age?, gender?, language? }
POST /api/auth/login         { email, password }
GET  /api/auth/me            → current user (requires token)
PUT  /api/auth/preferences   → update language, content preferences
```

### Mood
```
POST /api/mood/checkin       { moodScore, rawText?, selectedEmotions?, context? }
  → returns: moodEntry, recommendations[], crisis? (if detected)

GET  /api/mood/history       ?page=1&limit=20&days=30
GET  /api/mood/today         → did user check in today?
POST /api/mood/:id/followup  { followUpScore } → how do you feel after recs?
GET  /api/mood/calm-mode     → breathing exercises + helplines (no auth needed)
```

### Chat (Mia AI Companion)
```
POST /api/chat/message       { content, sessionId? }
  → returns: message (from Mia), sessionId, crisis?

GET  /api/chat/sessions      → list all chat sessions
GET  /api/chat/history/:sessionId
```

### Journal
```
POST /api/journal            { content, title?, mood?, tags? }
  → returns: entry + AI reflection + crisis check

GET  /api/journal            ?page=1&limit=15
GET  /api/journal/:id
DELETE /api/journal/:id
```

### Recommendations
```
GET  /api/recommendations    ?type=song|movie|podcast|game|audiobook
POST /api/recommendations/:id/feedback  { liked, consumed, helpedMood }
```

### Analytics
```
GET  /api/analytics/dashboard       → streak, avg mood, trend chart, burnout risk
GET  /api/analytics/weekly-report   → AI-generated weekly summary
GET  /api/analytics/patterns        → mood by day, top stressors, sleep correlation
```

### Community (Anonymous)
```
GET  /api/community/posts           ?tag=&category=&page=
POST /api/community/posts           { content, mood?, tags?, category? }
POST /api/community/posts/:id/hug
POST /api/community/posts/:id/reply { content }
```

---

## Crisis Detection

The crisis system runs on **every single text input** — mood entries, chat messages, journal entries, community posts. It uses:

1. Keyword scanning in English + Hindi
2. GPT verification for medium+ detections
3. Graduated response (not clinical — warm and human)
4. Helplines: iCall (9152987821), Vandrevala Foundation (1860-2662-345)

Levels: `none` → `low` → `medium` → `high` → `critical`

For `critical` community posts — the post is **blocked** and crisis help is shown instead.

---

## Connecting to your React frontend

Every protected route requires:
```
Authorization: Bearer <token>
```

After login/signup, store the token:
```javascript
localStorage.setItem('token', data.token);

// Add to all API calls:
headers: { Authorization: `Bearer ${token}` }
```

Base URL in your React `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment (Render — free tier)

1. Push to GitHub
2. Go to render.com → New Web Service → Connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

Update `CLIENT_URL` to your Netlify frontend URL.

---

## What to build next

- [ ] Hindi/Marathi language detection (auto-switch AI prompts)
- [ ] Weekly email reports via Nodemailer
- [ ] School/counselor dashboard (admin role already in User model)
- [ ] PWA offline mode
- [ ] Push notifications for mood check-in reminders

---

*Built for the people who have nobody to talk to.*
