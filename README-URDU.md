# SClub — Serious Full-Stack Project 🚀

**Frontend:** Next.js 14 + React (proper components, pages)
**Backend:** Node.js API routes (`src/app/api/`) — auth, videos, categories, settings, view counter
**Database:** PostgreSQL (Neon, free tier)
**Deploy:** Vercel (free) — ek hi deploy mein frontend + backend

> **SClub = movies & trailers website.** Iska YouTube/Impera documentary kaam se koi taluq nahi — ye alag entertainment project hai. Trailer links (YouTube) sirf video source ke tor pe use hote hain.

```
sclub-project/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Public homepage (server component)
│   │   ├── layout.jsx
│   │   ├── globals.css
│   │   ├── admin/
│   │   │   ├── page.jsx          # Admin panel (login-guarded)
│   │   │   └── login/page.jsx    # Admin login
│   │   └── api/                  # ★ BACKEND ★
│   │       ├── auth/login/route.js
│   │       ├── auth/logout/route.js
│   │       ├── auth/me/route.js
│   │       ├── videos/route.js            # GET list / POST create
│   │       ├── videos/[id]/route.js       # PATCH / DELETE
│   │       ├── videos/[id]/view/route.js  # POST view counter
│   │       ├── categories/route.js
│   │       ├── categories/[id]/route.js
│   │       └── settings/route.js          # GET / PUT website settings
│   ├── components/
│   │   ├── HomeClient.jsx        # Homepage interactivity
│   │   ├── PlayerModal.jsx       # Video player + download + FB share
│   │   ├── AdSlot.jsx            # Adsterra code injector
│   │   └── AdminPanel.jsx        # Videos / Categories / Customize / Ads
│   └── lib/
│       ├── db.js                 # Postgres connection (Neon)
│       ├── auth.js               # bcrypt + JWT + settings
│       └── format.js             # Drive/YouTube link helpers
├── migrations/001_init.sql       # Database tables + seed data
└── package.json
```

## Local chalana (testing ke liye)

```bash
cd sclub-project
npm install
cp .env.example .env        # phir .env mein apni values likho
npm run dev                 # http://localhost:3000
```

## Deploy (production) — Step by step

### Step 1 — Neon database (FREE)
1. **neon.tech** → Sign up (Google se) → **Create project** (naam: `sclub`, region: Singapore — Pakistan ke qareeb)
2. Dashboard se **Connection string** copy karo (`.env` wali format)
3. Left menu → **SQL Editor** → `migrations/001_init.sql` ka poora text paste → **Run**

### Step 2 — GitHub
1. **github.com** → New repository → naam `sclub` → Create
2. **uploading an existing file** → `sclub-project` folder ki saari files drag kar do → Commit

### Step 3 — Vercel (FREE hosting + domain)
1. **vercel.com** → Sign up (GitHub se — 1 click)
2. **Add New → Project** → apni `sclub` repo select → **Import**
3. **Environment Variables** mein ye 4 add karo:
   - `DATABASE_URL` = Neon wali connection string
   - `JWT_SECRET` = koi lambi random line (jaise `sclub-9f8k2jdh47skd92jf`)
   - `ADMIN_EMAIL` = tumhari email
   - `ADMIN_PASSWORD` = strong password
4. **Deploy** dabao → 2 minute mein live: `https://sclub.vercel.app` 🎉

### Step 4 — Pehli login
1. `https://sclub.vercel.app/admin/login` kholo
2. Wahi `ADMIN_EMAIL` / `ADMIN_PASSWORD` se login karo (pehli login pe admin account DB mein ban jayega)
3. Admin panel se videos add karo, website customize karo — sab foran live!

## Baad mein custom domain (jaise sclub.sbs)
Vercel dashboard → Project → **Settings → Domains** → domain likho → diye gaye DNS records apne registrar (Namecheap) mein add karo. 5 minute ka kaam.

## Notes
- Videos ki files Drive/YouTube pe rehti hain — site unka smart front hai
- Admin panel `/admin` pe hai, sirf login ke baad khulta hai (JWT cookie, bcrypt passwords)
- Koi bhi env var badlo to Vercel pe **Redeploy** karna parega
