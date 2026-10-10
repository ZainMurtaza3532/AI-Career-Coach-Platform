# Sensai - AI Career Coach & Developer Platform

Sensai is an enterprise-grade, full-stack AI career acceleration platform engineered with Next.js 15 (App Router), Prisma ORM, Monaco Editor, and Google Gemini AI. It guides candidates through every dimension of hiring loops—from ATS resume creation and LinkedIn outreach to real-time voice phone screen agents and in-browser algorithmic coding interview sandboxes.

---

## 🚀 Key Modules & Capabilities

### 1. Live Phone Screen Interview Agent (`/interview/live-agent`)
- **Conversational Voice Turn-Taking**: Interactive speech synthesis and voice recognition simulating authentic hiring manager interviews.
- **Configurable Interviewer Personas**: Choose between FAANG Engineering Lead, Empathetic HR Partner, or Fast-Paced Startup CTO.
- **Dynamic Deep-Dive Probing**: Gemini evaluates responses on the fly and asks relevant follow-up questions to test candidate depth.
- **Multi-Metric Scoring**: Real-time evaluation of Technical Accuracy, Clarity, Pacing (WPM), and Executive Presence with actionable summary feedback.

### 2. Technical Coding Interview Sandbox (`/interview/coding`)
- **Monaco Code Editor Workspace**: Dark-mode (`vs-dark`) development environment supporting **JavaScript, TypeScript, Python, Java, C++, and Go**.
- **Adaptive Test Suite Generator**: Configurable sessions (1, 3, or 5 problems) targeting topics like Arrays & Hashing, Two Pointers, Trees, Dynamic Programming, and Graphs.
- **Sandboxed Test Runner**: Evaluates submissions against visible sample assertions and hidden boundary edge cases.
- **Progressive Hint Engine ("Co-Pilot Mode")**: 3-tier non-spoiler architectural hints (Level 1: Intuition, Level 2: Invariant/Data Structure, Level 3: Pseudo-code).
- **Asymptotic Big-O Complexity Auditor**: Analyzes algorithmic Time and Space complexity against optimal targets.
- **Analytics & Mastery Dashboard**: Recharts-powered chronological score trajectory, topic mastery bar charts, and KPI summary cards.

### 3. Voice Behavioral Mock Room (`/interview/voice`)
- **Speech-to-Text Transcription**: Practice speaking your interview answers aloud with real-time browser voice recognition.
- **STAR Methodology Scoring**: Automated grading across Situation, Task, Action, Result, and Communication Clarity.
- **Speech Hygiene Analytics**: Detects filler words, pacing bottlenecks, and generates gold-standard model answers.

### 4. Smart Resume Builder & ATS Scanner (`/resume`)
- **Live Markdown Workspace**: Real-time dual-pane editor with instant typography preview.
- **AI Content Enhancer**: Generates quantifiable impact statements, action verbs, and skills alignment.
- **ATS Compatibility Score**: Scans resumes for missing keywords, formatting errors, and recruiter best practices.
- **One-Click PDF Export**: Clean, printable PDF generation via `html2pdf.js`.

### 5. Tailored AI Cover Letter Architect (`/ai-cover-letter`)
- **Job Description Alignment**: Generates highly persuasive, personalized cover letters tailored to specific company requirements.
- **Clean Markdown Output**: Professional business layout ready for copying or saving.
- **Cover Letter Management**: Centralized dashboard to view, edit, organize, and export past applications.

### 6. AI LinkedIn & Cold Outreach Generator (`/ai-networking`)
- **Executive Profile Optimization**: Generates magnetic LinkedIn headlines and narrative "About" summaries.
- **Cold InMail Outreach**: Crafts high-conversion messaging templates for recruiters, hiring managers, and prospective mentors.

### 7. Real-Time Industry Trends & Salary Intelligence (`/dashboard`)
- **Role-Tailored Market Analytics**: Up-to-date compensation percentiles (min, median, max) based on declared specialization.
- **Growth Outlook & Demand Levels**: Tracks industry momentum, expanding sectors, and market demand flags.
- **Skill Recommendations**: Highlights trending skills to prioritize for promotions and interview loops.
- **Automated Inngest Cron Sync**: Weekly background refreshes of industry datasets.

### 8. Role-Gated Architecture & Profile Adaptations
- **Intelligent Classification Engine (`lib/industryCapabilities.js`)**: Dynamically determines technical vs. non-technical backgrounds.
- **Role-Gating**: Protects software engineering features (Coding Sandbox) so non-technical users (Marketing, Finance, HR, Sales, Design) are never asked coding/algorithm trivia.
- **Domain-Tailored Fallbacks**: Comprehensive fallback interview question banks for Marketing (CAC/LTV, ROAS), Finance (DCF, WACC), HR (labor law, mediation), and General Business.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router, Server Actions, Turbopack) |
| **Language** | JavaScript (ES2023), React 19 |
| **Styling** | Tailwind CSS, Radix UI Primitives, Lucide Icons |
| **Code Editor** | `@monaco-editor/react` (Multi-language Monaco runtime) |
| **Data Visualization**| `recharts` (AreaChart, BarChart, ResponsiveContainer) |
| **AI Intelligence** | Google Gemini AI (`@google/generative-ai`, `gemini-2.5-flash`) |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM |
| **Authentication** | Clerk Authentication (with distraction-free standalone auth views) |
| **Background Cron** | Inngest (Weekly scheduled background market sync) |
| **Form Management** | React Hook Form, Zod Schema Validation |
| **Document Export** | `@uiw/react-md-editor`, `html2pdf.js` |

---

## 📂 Project Architecture

```text
ai-career-coach/
├── actions/                         # Next.js Server Actions ("use server")
│   ├── coding.js                    # Monaco session generator, test runner, Big-O evaluator
│   ├── cover-letter.js              # Cover letter generation and management
│   ├── dashboard.js                 # Industry insights queries
│   ├── interview.js                 # Quiz generation, domain adaptation, scoring
│   ├── live-interview.js            # Live phone screen agent turns and evaluations
│   ├── resume.js                    # Resume persistence and ATS check
│   └── user.js                      # User onboarding and profile sync
├── app/                             # Next.js App Router Structure
│   ├── (auth)/                      # Standalone authentication routes
│   │   ├── sign-in/                 # Clerk Sign-In screen (no header/footer)
│   │   ├── sign-up/                 # Clerk Sign-Up screen (no header/footer)
│   │   └── layout.js                # Vertically centered brand auth layout
│   ├── (main)/                      # Protected application dashboard layout
│   │   ├── ai-cover-letter/         # Cover letter management & creation
│   │   ├── ai-networking/           # LinkedIn bio and cold outreach generator
│   │   ├── dashboard/               # Real-time industry intelligence & salary charts
│   │   ├── interview/               # Interview preparation hub
│   │   │   ├── coding/              # Monaco technical coding sandbox & analytics
│   │   │   ├── live-agent/          # Interactive voice phone screen agent
│   │   │   ├── mock/                # Domain-adapted assessment quiz runner
│   │   │   └── voice/               # Behavioral STAR mock interview simulator
│   │   ├── onboarding/              # Profile, industry, and skill setup
│   │   ├── resume/                  # Interactive resume builder & PDF export
│   │   └── layout.jsx               # Unified container & responsive gutters
│   ├── api/inngest/                 # Inngest cron webhook endpoint
│   ├── layout.js                    # Root layout with theme provider & clerk
│   └── page.js                      # Landing page with feature showcases
├── components/                      # Reusable UI & Layout Components
│   ├── ui/                          # Radix UI design tokens (Button, Card, Dialog, Tabs)
│   ├── conditional-layout.jsx       # Route-aware header/footer visibility controller
│   ├── header.jsx                   # Sticky navigation bar with role-gated items
│   ├── hero.jsx                     # Landing page hero section
│   └── theme-provider.jsx           # Dark/light theme provider
├── data/                            # Domain datasets (features, problems, industries)
│   ├── coding-problems.js           # Curated algorithmic problem bank & starters
│   ├── industries.js                # Industry taxonomy & specialization lists
│   └── features.js                  # Landing page capability showcases
├── lib/                             # Core utilities and clients
│   ├── checkUser.js                 # Clerk-to-Prisma user verification
│   ├── gemini.js                    # Multi-model resilient Gemini API caller
│   ├── industryCapabilities.js      # Role classification & domain fallback generator
│   └── prisma.js                    # Prisma Client singleton
└── prisma/
    └── schema.prisma                # PostgreSQL database schema & relationships
```

---

## 🗄️ Database Schema (Prisma Models)

- **`User`**: Core user record storing Clerk ID, profile details, industry, experience, skills, and relational links.
- **`CodingAssessment`**: Stores Monaco coding challenge submissions, scores (0-100), Big-O Time & Space complexities, test counts, runtime ms, feedback, and clean code metrics.
- **`LiveInterviewSession`**: Stores phone screen interview sessions, interviewer persona, conversation history, STAR scores, pacing (WPM), and summary critique.
- **`BehavioralInterview`**: Stores voice mock interview transcripts, individual question scores, and filler word analytics.
- **`Assessment`**: Tracks domain-adapted multiple-choice quizzes, individual questions, answers, and performance trends.
- **`Resume`**: Stores structured markdown resume content and improvement suggestions.
- **`CoverLetter`**: Contains generated cover letter text, company names, job titles, and source job descriptions.
- **`IndustryInsight`**: Caches market outlook, salary bands, top skills, and demand levels for every industry.

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
# Database Connection (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Route Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/onboarding"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/onboarding"

# Google Gemini Generative AI Key
GEMINI_API_KEY="AIzaSy..."
```

---

## 🚦 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm** or **pnpm**
- **PostgreSQL Database**: Free tier on [Neon](https://neon.tech)
- **Google AI Studio Key**: Free tier on [Google AI Studio](https://aistudio.google.com)
- **Clerk Account**: Free tier on [Clerk](https://clerk.com)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/ai-career-coach.git
cd ai-career-coach
npm install
```

### 3. Database Synchronization
Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the platform.

---

## 📜 Available NPM Scripts

- `npm run dev`: Runs the development server with Turbopack for fast HMR.
- `npm run build`: Generates the optimized Next.js production build.
- `npm run start`: Starts the application in production mode.
- `npm run lint`: Runs ESLint to check for code hygiene and best practices.
- `npm run postinstall`: Automatically runs `prisma generate` upon dependency installation.

---

## 📄 License

This project is licensed under the MIT License.
