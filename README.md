# ⚽ WC 2026 Predictions

A friend group predictions app for the FIFA World Cup 2026.  
Pick scores for every match, earn points, and compete on a live leaderboard.

**Scoring:** 🎯 Exact score = 3pts · 👍 Correct outcome = 1pt · ✕ Wrong = 0pts

---

## Stack

| Layer | Tech | Free tier |
|---|---|---|
| Frontend | React + Vite | — |
| Auth | Firebase Authentication | ✅ Generous free |
| Database | Firebase Firestore | ✅ 50k reads/day |
| Match data | football-data.org API | ✅ 10 req/min |
| Hosting | Vercel | ✅ Unlimited hobby projects |

---

## Setup (step by step)

### 1. Clone & install

```bash
git clone <your-repo>
cd wc-predictions
npm install
```

---

### 2. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Name it (e.g. `wc-predictions-2026`), disable Google Analytics if you want
3. Click **Continue** until project is created

#### Enable Authentication
- Sidebar → **Authentication** → **Get started**
- **Sign-in method** tab → Enable **Google** (add your support email)
- Enable **Email/Password** as well

#### Create Firestore database
- Sidebar → **Firestore Database** → **Create database**
- Choose **Start in production mode** (you'll add rules next)
- Pick a region close to your users (e.g. `europe-west1` for Europe)

#### Deploy security rules
Copy the rules from `firestore.rules` into:
- Firestore → **Rules** tab → paste → **Publish**

#### Get your web app config
- Project Settings (gear icon) → **Your apps** → **Add app** → Web (`</>`)
- Register app name, skip Firebase Hosting
- Copy the `firebaseConfig` object — you'll need those values

---

### 3. football-data.org API key

1. Register free at [football-data.org](https://www.football-data.org/client/register)
2. Check your email for the API key (it's instant)
3. Free tier allows 10 requests/minute and includes **FIFA World Cup 2026** (competition code: `WC`)

> **Note:** The 2026 World Cup runs June–July 2026. Before it starts, the API returns an empty matches list — this is normal. You can test with a past competition by temporarily changing `WC` to `EC` (Euros) or `PL` (Premier League) in `src/lib/footballApi.js`.

---

### 4. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all values from Firebase and football-data.org.

---

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 6. Deploy to Vercel (free)

1. Push your code to a **GitHub** repo (make sure `.env.local` is in `.gitignore` ✅)
2. Go to [vercel.com](https://vercel.com) → **Import project** → pick your repo
3. Add environment variables: in Vercel project settings → **Environment Variables**, add all the `VITE_*` keys from your `.env.local`
4. Click **Deploy** — done! Share the URL with friends

> Vercel auto-deploys on every push to main.

---

## Inviting friends

Just share the URL. Friends:
1. Open the link
2. Sign in with Google or create an email account
3. Start predicting matches

Everyone's predictions are saved in Firestore and the leaderboard updates automatically as match results come in.

---

## Project structure

```
src/
  lib/
    firebase.js         Firebase init
    footballApi.js      Match data + scoring logic
  context/
    AuthContext.jsx     Auth state + login/logout
  hooks/
    usePredictions.js   Read/write predictions from Firestore
  components/
    Navbar.jsx
    MatchCard.jsx       Match display + prediction input
    Toast.jsx           Notification system
  pages/
    AuthPage.jsx        Login / register
    MatchesPage.jsx     All matches with prediction inputs
    LeaderboardPage.jsx Friend rankings
```

---

## Firestore data model

```
users/{uid}
  displayName: string
  email: string
  photoURL: string | null
  createdAt: timestamp

predictions/{uid}_{matchId}
  uid: string
  matchId: number
  homeScore: number
  awayScore: number
  updatedAt: timestamp
```

---

## Customising

- **Add more flags** — edit `FLAG_MAP` in `MatchCard.jsx`
- **Change scoring** — edit `calculatePoints` in `footballApi.js`
- **Lock predictions** at kick-off — the app already blocks editing once a match is `LIVE` or `FINISHED`
- **Group by matchday** — add a `groupBy` on `match.matchday` in `MatchesPage.jsx`
