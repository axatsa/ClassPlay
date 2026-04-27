# ClassPlay

AI-powered educational gaming platform for teachers. Generate lessons, launch interactive games, and track student progress — all in one place.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animations | Framer Motion |
| Charts | Recharts |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL + SQLAlchemy |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-4o / Gemini |
| Email | SMTP (configurable) |
| Payments | Stripe |

---

## Features

### AI Generators (7 types)
- **Math problems** — arithmetic, equations, word problems
- **Quiz** — multiple-choice with distractors
- **Crossword** — auto-grid from word list
- **Assignment** — written task with rubric
- **Jeopardy** — board game format, multiple correct answers
- **Hangman** — word list with 4-step progressive hints
- **SpellingBee** — word list with TTS pronunciation

All generators support custom materials (PDF/DOCX/TXT upload), language selection (RU/UZ/EN), and class context.

### Games (10 total)
| Game | Description |
|------|-------------|
| Jeopardy | Category board, buzzer, score tracking |
| Crossword | Auto-generated grid, timer |
| Word Search | Find words in letter grid |
| Memory Matrix | Card flip matching |
| Tug of War | Team vs team quiz battle |
| Balance Scales | Math equation balancing |
| **Hangman** | SVG hangman + progressive hints |
| **SpellingBee** | TTS pronunciation + 5 voice presets |
| **MathPuzzle** | Timer, streak multiplier, results screen |
| **WordTranslate** | Flip-card vocabulary practice |

### Book Library
- AI-generated illustrated storybooks
- Page-flip reader with progress bar + percentage button
- Reading position persisted in localStorage
- Export to PDF

### User Materials
- Upload PDF / DOCX / TXT (up to 5 MB)
- AI uses uploaded content for generation
- Limits: Free = 5 files, Pro = 30, School = 100

### Analytics
- Activity chart (14 days), game type distribution, top topics
- Token usage with live data from subscription API
- Streak counter
- Accessible in Profile → Analytics tab (optimised for display on electronic boards)

### B2B / Organisations
- `org_admin` role — manage teachers, seats, invites
- Organisation dashboard with license usage, teacher table, invite links
- Super admin: promote/demote org_admin, set token limits per org

### Roles
| Role | Access |
|------|--------|
| `teacher` | Dashboard, all generators, games, library, history, profile |
| `org_admin` | All teacher pages + `/org-admin` management panel |
| `super_admin` | Full admin panel at `/admin` |

---

## Running Locally

### Requirements
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in DATABASE_URL, SECRET_KEY, OPENAI_API_KEY
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd front
npm install
cp .env.example .env          # set VITE_API_URL=http://localhost:8000/api/v1
npm run dev
```

App opens at `http://localhost:5173`.

---

## Project Structure

```
OnlineGame_v3/
├── backend/
│   ├── apps/
│   │   ├── auth/          # JWT login, registration, password reset, rate limiting
│   │   ├── classes/       # Class groups, students
│   │   ├── generator/     # AI generation endpoints + token quota
│   │   ├── gamification/  # Activity completion, streaks
│   │   ├── library/       # AI storybooks
│   │   ├── payments/      # Stripe, subscription tiers
│   │   ├── org_admin/     # Org management API
│   │   └── admin/         # Super admin panel API
│   ├── services/
│   │   └── openai_service.py   # All AI generation logic
│   └── main.py
│
├── front/
│   └── src/
│       ├── pages/
│       │   ├── auth/           # Login, Register, ForgotPassword
│       │   ├── dashboard/      # TeacherDashboard, Profile (+ Analytics tab), OrgAdminDashboard
│       │   ├── games/          # 10 game components
│       │   ├── tools/          # Generator, Tools, ResultEditor
│       │   └── library/        # GamesLibrary, BookReaderFlip
│       ├── components/
│       │   ├── layout/         # TeacherNavbar
│       │   ├── library/        # BookReaderFlip
│       │   └── Onboarding/     # OnboardingModal
│       └── context/
│           ├── AuthContext.tsx
│           ├── ClassContext.tsx
│           └── ThemeContext.tsx
│
└── docs/                       # Plans, deployment guides, secrets template
```

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://user:pass@localhost/classplay
SECRET_KEY=your-secret-key
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...           # optional fallback
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app-password
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Subscription Tiers

| Feature | Free | Pro ($15/mo) | School ($49/mo) |
|---------|------|--------------|-----------------|
| Token limit | 10 000 | 100 000 | 200 000 / teacher |
| Material uploads | 5 | 30 | 100 |
| Teacher seats | 1 | 1 | unlimited (org) |
| Org admin panel | — | — | ✓ |

---

## Deployment

See [`docs/DEPLOY_HTTPS.md`](docs/DEPLOY_HTTPS.md) for Nginx + Let's Encrypt setup.

Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```
