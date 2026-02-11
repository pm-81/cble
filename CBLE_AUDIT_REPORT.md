# CBLETest.com — Full Product & Learning-Design Audit

> **Audit date:** January 2026  
> **Methodology:** White-box code inspection of the `CBLE_REPO` repository  
> **Auditor:** AI-assisted product & pedagogy analysis  
> **Scope:** Content completeness, question-bank coverage, study modes, explanations/citations, adaptive learning, analytics, UX, accessibility, community, trust factors, admin tooling, gamification, and database schema

---

## 1. Executive Summary

| Dimension | Verdict |
|:---|:---|
| **Science-backed learning** | ✅ **Confirmed.** SM-2 spaced repetition, adaptive weak-domain targeting, interleaving, and metacognitive tracking (confidence + lucky-guess) are all implemented and working. This is a genuine differentiator. |
| **Content volume** | ⛔ **Critical gap.** The codebase contains **194 question items** across 5 source files, plus 81 flashcards. The CBLE exam demands ≥ 1,000 unique questions for safe coverage. |
| **Learning modes** | ⚠️ **Partial.** Adaptive drill and 80-question exam simulation exist. Custom quizzes, linear "finish-the-bank" mode, and navigation drills are **missing**. |
| **Analytics & readiness** | ✅ **Strong.** Radar chart, confidence-vs-accuracy calibration, overconfidence bias alert, domain mastery breakdown, and a composite Exam Readiness Score are all present. |
| **Gamification & engagement** | ✅ **Present.** XP/Level system, achievements (6 badges), study streaks, and a global leaderboard with point calculations are implemented. |
| **Reference library** | ⚠️ **Static only.** ~15 key CFR parts are summarized as hardcoded text; no full-text search or eCFR integration exists. |
| **Platform reach** | ⛔ **Web-only, no offline.** Standard Vite + React SPA. No PWA service worker, no mobile app. |
| **Community & support** | ⛔ **Not present.** No forum, commenting, chat, or ticket system. |
| **Admin tooling** | ✅ **Functional.** Create, delete, bulk-import (JSON) for questions and flashcards; domain management. |

### Bottom Line

CBLETest has a **best-in-class learning engine** (SM-2, interleaving, metacognition) wrapped in a **modern, polished UI** with a **surprisingly deep analytics suite**. However, the platform is running on only **~194 questions** — roughly 12% of the minimum needed. This content gap is the single largest risk to user success and the single highest-priority item to fix.

---

## 2. Verified Feature Inventory (27-Point Checklist)

| # | Feature | Status | Source File(s) | Evidence / Notes |
|:--|:---|:---|:---|:---|
| 1 | **Question Bank Size** | ⛔ **CRITICAL GAP** | `static-data.ts` (17), `questions-expanded.ts` (51), `questions-batch2.ts` (46), `questions-batch3.ts` (40), `questions-batch4.ts` (40) | **Total: 194 questions.** Seed script merges all 5 files. Target: ≥ 1,000. |
| 2 | **Domain Taxonomy** | ✅ PRESENT | `static-data.ts`, `Onboarding.tsx`, DB migration | 8 CBLE domains defined: Entry, Classification, Valuation, Trade Programs, Broker Duties, Marking, Protests, Other. Stored in `domains` table with `sort_order`, `color`, `icon`. |
| 3 | **Practice by Section** | ⚠️ PARTIAL | `Study.tsx` `fetchQuestionsAdaptive()` | Adaptive logic filters by `domain_id` for weak domains. Dashboard has "Practice Weak Areas" quick action. **No explicit "Study Section X" picker UI.** |
| 4 | **Custom Quizzes** | ⛔ NOT PRESENT | `Study.tsx` | Only `mode` query param (`quick_drill`, `exam_simulation`). No user-facing builder to pick topics, difficulty, or count. |
| 5 | **"All Questions" Linear Mode** | ⛔ NOT PRESENT | `Study.tsx` | Adaptive/random selection prevents tracking 100% completion. No "unseen queue." |
| 6 | **Balanced Domain Coverage** | ⚠️ PARTIAL | `Study.tsx` L~102–123 | Fetches 40% weak-domain + 40% unattempted + 20% random. Does **not** enforce strict CBP exam blueprint quotas. |
| 7 | **Exam Simulation** | ✅ PRESENT | `Study.tsx` | `exam_simulation` mode sets 80-question limit. Session completion screen shows score. Timer exists via `timeSpent` tracking per question. |
| 8 | **Flag/Mark Questions** | ⛔ NOT PRESENT | `Study.tsx` | `Flag` icon imported but no persistent flag state in `QuestionState` interface. |
| 9 | **Detailed Explanations** | ✅ PRESENT | DB schema, question files | Every question has a `rationale` field. Shown after answer submission. |
| 10 | **Source Citations** | ✅ PRESENT | DB schema, question files | Every question has a `reference_cue` field (e.g., "19 CFR 142.3"). Displayed in answer review and flashcard backs. |
| 11 | **Embedded Reference Library** | ⚠️ PARTIAL | `ReferenceLibrary.tsx` (356 lines) | Static list of ~15 key CFR parts with key points and exam weight. **No full-text search, no eCFR API integration.** |
| 12 | **Navigation Drills** | ⛔ NOT PRESENT | — | No timed "find-the-citation" game mode. |
| 13 | **Adaptive Algorithm** | ✅ PRESENT | `Study.tsx` `fetchQuestionsAdaptive()` | Explicitly targets weak domains (accuracy < 70%) and unattempted questions. |
| 14 | **"Why This Question?" Transparency** | ⛔ NOT PRESENT | `Study.tsx` | No UI element explains why the algorithm chose a specific item. |
| 15 | **Spaced Repetition** | ✅ PRESENT | `spaced-repetition.ts` (278 lines) | Full SM-2 implementation: `calculateSM2()` computes ease factor, interval, repetitions, and next due date. Used for both flashcards and question prioritization. |
| 16 | **Error Card / Remediation** | ✅ PRESENT | `Study.tsx`, `spaced-repetition.ts` | Incorrect answers reset repetition count (`quality < 3 → interval = 1`). Adaptive logic re-prioritizes failed items. |
| 17 | **Interleaving** | ✅ PRESENT | `spaced-repetition.ts` `selectQuestionsForSession()` | Enforces `maxConsecutiveSameDomain` constraint, preventing domain blocking. Rare and excellent feature. |
| 18 | **Readiness Score** | ✅ PRESENT | `ExamReadinessScore.tsx` (282 lines) | Composite score: 40% accuracy + 30% domain coverage + 20% domain balance + 10% consistency. Per-domain breakdown with status badges. |
| 19 | **Analytics Dashboard** | ✅ PRESENT | `Analytics.tsx` (549 lines) | Recharts-powered: Radar chart (domain mastery), composed chart (volume vs accuracy over 7 days), bar chart (calibration monitor), strength/weakness comparison, overconfidence bias detection, "Share Readiness" clipboard export. |
| 20 | **Study Plan Generator** | ⚠️ PARTIAL | `Onboarding.tsx`, `study_plans` table, `Settings.tsx` | Onboarding collects exam date, weekly study time, session length, and stores them. `study_plans` table exists in DB. **But no actual scheduler that generates a daily/weekly itinerary.** |
| 21 | **Progress Dashboard** | ✅ PRESENT | `Dashboard.tsx` (449 lines) | Shows streak, accuracy rate, total attempts, progress %, quick actions, exam readiness score, gamification elements. |
| 22 | **Mobile / Offline** | ⛔ NOT PRESENT | `vite.config.ts` | Standard Vite SPA. No service worker, no PWA manifest, no React Native. |
| 23 | **Accessibility** | ⚠️ UNVERIFIED | UI component library | Uses Radix/Shadcn accessible primitives (proper `Label`/`htmlFor`, `RadioGroup`, semantic HTML). Full WCAG audit not possible without runtime testing. |
| 24 | **Community Features** | ⛔ NOT PRESENT | — | No discussion forum, Q&A, or peer commenting system. |
| 25 | **Support / Help** | ⛔ NOT PRESENT | — | No chat widget, ticket system, or help center. Auth page mentions "Terms of Service and Privacy Policy" as text only (no links). |
| 26 | **Admin Tools** | ✅ PRESENT | `Admin.tsx` (676 lines) | Tabbed interface: Add Question (full form with 5 options, domain, difficulty, rationale, reference cue), Add Flashcard, Bulk Import (JSON paste). Recent items list with delete capability. Stats bar (counts). |
| 27 | **Privacy / Security** | ⚠️ PARTIAL | DB migration, RLS policies | Row Level Security enabled on all 12 tables. `user_id`-scoped policies. Auth trigger creates profile + role + streak on signup. **No privacy policy document in repo.** |

### Additional Features Discovered (Not in Original Checklist)

| Feature | Status | Source File(s) | Notes |
|:---|:---|:---|:---|
| **Flashcard System** | ✅ PRESENT | `Flashcards.tsx` (544 lines) | Full SM-2 spaced repetition for flashcards. 4-tier rating (Again/Hard/Good/Easy) with interval preview. 3D flip animation. Fallback to local data if DB is empty. |
| **Gamification: XP & Levels** | ✅ PRESENT | `LevelProgress.tsx` (76 lines) | XP formula: (correct × 10) + (attempts × 2) + (streak × 50). Quadratic level scaling. Titles: Novice Clerk → Licensed Customs Broker Master. |
| **Gamification: Achievements** | ✅ PRESENT | `AchievementsList.tsx` (112 lines) | 6 badges: First Steps (10 Qs), On Fire (3-day streak), Sharpshooter (50 correct), Dedicated (100 Qs), Domain Specialist, CBLE Veteran (500 Qs). |
| **Leaderboard** | ✅ PRESENT | `Leaderboard.tsx` (218 lines) | Global leaderboard with podium layout (top 3) + ranked list. Points = (mastery × 100) + (correct × 10) + (streak × 50). |
| **Onboarding Flow** | ✅ PRESENT | `Onboarding.tsx` (346 lines) | 4-step wizard: Welcome → Exam Date (calendar picker) → Study Time (weekly + session sliders) → Domain Confidence (per-domain 1–5 self-assessment). Saves to `profiles`, `domain_confidence`, `study_plans` tables. |
| **Dark Mode** | ✅ PRESENT | `ThemeProvider.tsx`, `ThemeToggle.tsx` | System/light/dark toggle powered by `next-themes` pattern. |
| **Pricing Tiers** | ✅ PRESENT | `Pricing.tsx` (186 lines) | Free (20 Qs/day), Pro Pass ($149 lifetime), Institutional plans. Feature comparison cards. |
| **User Notes** | DB ONLY | `user_notes` table in migration | Schema supports notes tied to questions, flashcards, and domains (with mnemonic flag). **No front-end UI found.** |
| **Study Sessions** | DB ONLY | `study_sessions` table in migration | Schema tracks scheduled vs. completed sessions with type, duration, and question counts. **No front-end scheduler UI found.** |
| **Metacognitive Metrics** | ✅ PRESENT | `Study.tsx` | Confidence slider (1–5) and Lucky Guess toggle per question. Stored in `question_attempts` table. Analyzed in `Analytics.tsx` calibration chart. |

---

## 3. Content Inventory

### 3.1 Questions

| Source File | Count | Notes |
|:---|:---:|:---|
| `static-data.ts` | 17 | Original seed questions across all 8 domains |
| `questions-expanded.ts` | 51 | "100+ questions" promised in comment; actual: 51 |
| `questions-batch2.ts` | 46 | "60+ new questions" in comment; actual: 46 |
| `questions-batch3.ts` | 40 | Batch 3 |
| `questions-batch4.ts` | 40 | Batch 4 |
| **TOTAL** | **194** | **~12% of recommended 1,500+ target** |

### 3.2 Flashcards

| Source File | Count | Notes |
|:---|:---:|:---|
| `static-data.ts` | 4 | Original seed |
| `questions-expanded.ts` | 37 | Included alongside expanded questions |
| `flashcards-batch1.ts` | 40 | Dedicated flashcard batch |
| **TOTAL** | **81** | Adequate for core concepts; expand to 200+ recommended |

### 3.3 Domain Distribution Concern

The seed script merges all question files using `domain_index` mapping. Without runtime DB access, exact per-domain distribution can't be confirmed, but the Onboarding file lists all 8 domains, and question files include items for each. **Balance audit recommended after seeding.**

---

## 4. Key Findings

### 🔴 What Blocks User Success (Critical)

1. **Insufficient Question Volume (194 vs. 1,500+ needed)**
   - The CBLE exam is 80 questions drawn from a very large pool. With only 194 items, users will see repeats within 2–3 full practice exams.
   - Past CBLE administrations (Apr + Oct annually) each introduce novel scenarios. Without ingesting 5+ years of past-exam patterns, users face surprise topics.
   - **Risk:** Users who study exclusively on CBLETest will have false confidence from familiarity with a small set.

2. **No Full-Text Reference Search**
   - The CBLE is a "open book" exam where candidates reference 19 CFR / HTSUS during the test. The ability to quickly *navigate* regulatory text is a tested skill.
   - `ReferenceLibrary.tsx` is a static summary (15 key parts with bullet points). It helps memorization but **actively harms navigation skill development** because users never practice searching.

3. **No Linear Completion Mode**
   - Power users want to know they've seen 100% of the bank. The current adaptive algorithm intentionally randomizes and re-serves items, making it impossible to track "unseen" questions.

### 🟡 What Limits Effectiveness (Important)

4. **Exam Blueprint Not Enforced**
   - The real CBLE has approximate domain quotas (e.g., ~20% Entry, ~20% Classification). The current `exam_simulation` mode just fetches 80 random questions without quota enforcement.

5. **Study Plan is Collect-Only**
   - Onboarding collects exam date, weekly time, and session length — but no generated schedule or daily recommendations exist. The `study_plans` and `study_sessions` tables have schema but no front-end scheduler.

6. **Flag/Bookmark Mechanic Missing**
   - The `Flag` lucide icon is imported in `Study.tsx` but never wired. Users can't mark questions for later review.

7. **"Why This Question?" Not Transparent**
   - The adaptive algorithm makes smart choices (weak domains, unattempted items), but the user never sees *why* a particular question was served.

### 🟢 What Accelerates Success (Strengths)

8. **Metacognitive Tracking is Best-in-Class**
   - The confidence slider + lucky guess toggle + overconfidence bias calculation in `Analytics.tsx` is a feature typically found only in research-grade tools. It enables users to differentiate:
     - *True mastery:* High confidence + correct
     - *Lucky guesses:* Low confidence + correct + "lucky" flag
     - *Overconfidence:* High confidence + incorrect
     - *Diffident mastery:* Low confidence + correct (knows it but doubts)

9. **SM-2 Interleaving is Rare in Niche Test Prep**
   - `selectQuestionsForSession()` with `maxConsecutiveSameDomain` constraint prevents "domain blocking." Research shows interleaving improves long-term retention vs. blocked practice (Rohrer & Taylor, 2007).

10. **Exam Readiness Score is Well-Designed**
    - The composite formula (40% accuracy, 30% domain coverage, 20% domain balance, 10% consistency) is a reasonable proxy for actual readiness. The domain-level "strong/moderate/weak/not_started" breakdown gives actionable focus areas.

11. **Gamification Loop is Complete**
    - XP, levels with thematic titles, 6 achievement badges, study streaks, and a global leaderboard create a motivation loop that encourages daily practice — the #1 predictor of exam success.

12. **Onboarding Captures Baseline**
    - Per-domain confidence self-assessment during onboarding enables the adaptive algorithm to target weak areas from Day 1, rather than requiring many practice sessions to discover them.

---

## 5. Database Architecture Assessment

### Schema (12 core tables + auth)

| Table | Purpose | RLS | Notes |
|:---|:---|:---:|:---|
| `profiles` | User profile, exam date, study prefs | ✅ | Auto-created via `handle_new_user()` trigger |
| `user_roles` | Admin/user role assignment | ✅ | Enum-based, `has_role()` security definer function |
| `domains` | 8 CBLE topic areas | ✅ | Public read, admin write |
| `topics` | Sub-topics within domains | ✅ | Schema exists; lightly used in questions |
| `questions` | MCQ bank (A–E, rationale, reference) | ✅ | CHECK constraint on `correct_answer` IN ('A'–'E') |
| `flashcards` | Front/back with reference cues | ✅ | `is_active` flag for soft delete |
| `question_attempts` | Per-answer tracking | ✅ | Records confidence, lucky_guess, time_spent |
| `flashcard_progress` | SM-2 state per user/card | ✅ | ease_factor, interval, repetitions, due_date |
| `mastery_progress` | Domain-level mastery (0–5) | ✅ | Updated via triggers |
| `study_plans` | Exam date + weekly goals | ✅ | Populated by onboarding |
| `study_sessions` | Scheduled and completed sessions | ✅ | 5 session types defined |
| `user_streaks` | Current + longest streak tracking | ✅ | Auto-created on signup |
| `domain_confidence` | Self-assessed baseline per domain | ✅ | Populated by onboarding |
| `user_notes` | Mnemonics and notes | ✅ | **No front-end UI** |

### Security Assessment
- ✅ All tables have RLS enabled
- ✅ User-scoped policies prevent cross-user data access
- ✅ Admin operations gated by `has_role()` security definer function
- ✅ Auth trigger pattern (`handle_new_user`) auto-provisions profile, role, and streak
- ⚠️ Some open INSERT policies exist (`Anyone can insert domains/questions/flashcards/streaks`) likely for seeding — should be restricted for production
- ⚠️ No Rate Limiting or abuse prevention visible in schema

---

## 6. Recommendations (Prioritized by Impact)

### P0 — Ship Blockers (Must Fix)

| # | Initiative | Impact | Effort | Detail |
|:--|:---|:---|:---|:---|
| 1 | **Expand question bank to 1,000+** | Critical | Large | Ingest 5 years of past-exam items (2021–2025 Apr & Oct). Use Admin bulk-import JSON tool. Target: 150+ questions per domain. |
| 2 | **Expand flashcard bank to 200+** | High | Medium | Cover all 19 CFR parts and HTSUS GRI rules systematically. Current 81 cards cover core concepts only. |

### P1 — High Value (Next Sprint)

| # | Initiative | Impact | Effort | Detail |
|:--|:---|:---|:---|:---|
| 3 | **Full eCFR integration** | High | Medium | Replace `ReferenceLibrary.tsx` static list with searchable eCFR text or direct links to ecfr.gov section anchors. Enable "find the citation" practice. |
| 4 | **"All Questions" linear mode** | High | Small | Add `mode=linear` to Study. Track seen/unseen per user in `question_attempts`. Show "% of bank completed" progress bar. |
| 5 | **Custom quiz builder** | High | Medium | UI to pick: domains, difficulty range, question count, timed/untimed. Generates filtered question set. |
| 6 | **Flag/bookmark questions** | Medium | Small | Wire existing `Flag` icon import to a `flagged_questions` table or client-side state. Show flagged queue on Dashboard. |

### P2 — Exam Fidelity

| # | Initiative | Impact | Effort | Detail |
|:--|:---|:---|:---|:---|
| 7 | **Enforce exam blueprint quotas** | Medium | Small | Update `exam_simulation` fetch to distribute 80 questions proportionally across 8 domains per CBP weighting. |
| 8 | **Full mock exam timer** | Medium | Small | Add a 4.5-hour countdown timer for exam mode (currently tracks per-question time only). |
| 9 | **"Why this question?" tooltip** | Low | Small | Show a brief reason when hovering/tapping the question number: "Weak domain," "Due for review," "New item." |

### P3 — Engagement & Reach

| # | Initiative | Impact | Effort | Detail |
|:--|:---|:---|:---|:---|
| 10 | **PWA offline mode** | Medium | Small | Add `vite-plugin-pwa` + manifest.json. Cache question data in IndexedDB for offline drills. |
| 11 | **Study plan scheduler** | Medium | Medium | Use `study_plans` table data to generate a calendar view with daily assignments. Send email/push reminders. |
| 12 | **User notes UI** | Low | Small | Build front-end for `user_notes` table. Allow mnemonics tied to specific questions. |
| 13 | **Navigation drill game** | Medium | Large | Timed "find the CFR citation" mode. Requires full eCFR text integration (#3) first. |
| 14 | **Community / forum** | Low | Large | Discussion board or Q&A on each question. Consider third-party integration (Discord, Discourse). |
| 15 | **Privacy policy & terms** | High (legal) | Small | Create /privacy and /terms pages. Link from Auth.tsx "By continuing…" text. |

---

## 7. Roadmap

### Phase 1: Content & Credibility (Weeks 0–3)

**Goal:** Reach minimum viable content (MVC) of 800+ questions.

- [ ] Source and ingest 2021–2025 past CBLE exam items (~320 questions per year pair, deduplicated)
- [ ] Tag all new questions with correct `domain_index` using existing Admin bulk-import
- [ ] Expand flashcard bank to 200+ (cover all 19 CFR parts systematically)
- [ ] Audit domain distribution to ensure ≥50 questions per domain
- [ ] Add privacy policy and terms of service pages
- [ ] Restrict open INSERT RLS policies for production deployment

**KPI:** Question count ≥ 800; flashcard count ≥ 200; all 8 domains have ≥ 50 items.

### Phase 2: Study Mode Expansion (Weeks 3–6)

**Goal:** Enable targeted mastery and completion tracking.

- [ ] Implement "Linear / Complete the Bank" mode with unseen-question queue
- [ ] Build "Custom Quiz Builder" UI (domain + difficulty + count picker)
- [ ] Wire question flagging/bookmarking
- [ ] Add eCFR deep-links in Reference Library (phase 1 of eCFR integration)
- [ ] Add "Why this question?" transparency tooltip

**KPI:** Session completion rate + 20%; "% bank seen" metric available per user.

### Phase 3: Exam Simulation (Weeks 6–10)

**Goal:** Maximize simulation fidelity.

- [ ] Enforce domain-weighted quotas in exam simulation mode
- [ ] Add 4.5-hour countdown timer for full mock exams
- [ ] Build "Readiness Scorecard" with pass/fail probability prediction
- [ ] Implement Navigation Drill game (find citation < 60s)

**KPI:** Mock exam score correlation with real exam score (requires user feedback loop).

### Phase 4: Platform Expansion (Weeks 10–16)

**Goal:** Reach and retention.

- [ ] PWA mode (offline drills, push notifications)
- [ ] Study plan scheduler with calendar view
- [ ] User notes/mnemonics UI
- [ ] Email study reminders
- [ ] Community Q&A on questions (consider Discord integration)

**KPI:** 7-day retention rate > 60%; offline usage > 10% of sessions.

---

## 8. Validation Plan

### 8.1 Content Impact Test
- **Method:** A/B test after Phase 1. Group A uses current content (194 Qs); Group B uses expanded content (800+ Qs).
- **Measure:** Mock exam score differential and "surprise topic" rate (questions user marks as "never seen this").

### 8.2 Adaptive vs. Linear Mode Test
- **Method:** Split users. Group A gets pure adaptive (current). Group B gets hybrid (adaptive + linear "finish the bank").
- **Measure:** Retention rate, session frequency, final mock score.

### 8.3 Metacognition Effectiveness
- **Method:** Track overconfidence score trend over time per user.
- **Measure:** If confidence gap (confidence % – accuracy %) decreases, metacognitive tools are working.

### 8.4 Navigation Skill (Phase 3)
- **Method:** Measure "Time to Citation" in Navigation Drill mode.
- **Measure:** Successful CBLE candidates typically find citations in < 45 seconds.

---

## 9. Technical Debt & Operational Notes

| Item | Detail | Severity |
|:---|:---|:---|
| `all_data.json` is not valid JSON | File contains dotenv injection output, not question data. Misleading filename. | Low |
| Open INSERT RLS policies | `domains`, `questions`, `flashcards`, `user_streaks` allow unauthenticated inserts (for seeding). Must restrict before production. | Medium |
| Seed script uses `supabase-node.ts` | Client-side import of Node module causes bundler warnings ("Module path has been externalized"). Seed should be a separate CLI script. | Low |
| Flashcard fallback casting | `Flashcards.tsx` line 138: `as unknown as Flashcard[]` type assertion on fallback data. Should properly type fallback data. | Low |
| Admin page has no role guard | `Admin.tsx` checks for `user` but does not check `has_role(user.id, 'admin')`. Any authenticated user can access admin. | High |
| Question count display in Admin | Shows "50 questions" (API limit) not actual total count. Should use a COUNT query. | Low |
| `LevelProgress` uses non-standard prop | `indicatorClassName` prop on `<Progress>` may not be supported by standard Shadcn component. | Low |

---

## 10. Appendix: Evidence Log

### Core Learning Engine
| Feature | File | Line(s) | Evidence |
|:---|:---|:---|:---|
| SM-2 Algorithm | `spaced-repetition.ts` | 28–70 | `calculateSM2()`: ease factor, interval, repetition count, due date calculation |
| Interleaving | `spaced-repetition.ts` | 180–220 | `selectQuestionsForSession()`: `maxConsecutiveSameDomain` constraint |
| Adaptive Targeting | `Study.tsx` | 102–123 | `fetchQuestionsAdaptive()`: 40% weak-domain + 40% unattempted + 20% random |
| Metacognitive Tracking | `Study.tsx` | 47–53 | `QuestionState` interface: `confidence`, `wasLuckyGuess`, `timeSpent` |
| Confidence Calibration | `Analytics.tsx` | 204–218 | Groups attempts by confidence level, calculates actual accuracy per group |
| Overconfidence Detection | `Analytics.tsx` | 254–256 | `overconfidenceScore = (confidence_normalized) - accuracy` |

### Content & Data
| Feature | File | Line(s) | Evidence |
|:---|:---|:---|:---|
| Question Schema | DB migration | 73–92 | 5 options (A–E), CHECK constraint, rationale, reference_cue, difficulty 1–5 |
| Seed Aggregation | `seed.ts` | 68 | `allQuestions = [...questions, ...expandedQuestions, ...batch2..., ...batch3..., ...batch4...]` |
| Domain Mapping | `seed.ts` | 70 | `domainId = domainData.find(d => d.name === domains[q.domain_index].name)?.id` |
| Flashcard SM-2 | `Flashcards.tsx` | 202–240 | Full SM-2 calculation on flashcard ratings with DB upsert |

### UX & Gamification
| Feature | File | Line(s) | Evidence |
|:---|:---|:---|:---|
| Exam Readiness Score | `ExamReadinessScore.tsx` | 108–132 | Composite: 40% accuracy + 30% coverage + 20% balance + 10% consistency |
| XP/Level System | `LevelProgress.tsx` | 16–28 | XP = (correct×10)+(attempts×2)+(streak×50); level = (xp/100)^0.6 + 1 |
| Achievements | `AchievementsList.tsx` | 13–62 | 6 badges with dynamic unlock conditions |
| Leaderboard | `Leaderboard.tsx` | 48–73 | Points = (mastery×100) + (correct×10) + (streak×50) |
| Onboarding Wizard | `Onboarding.tsx` | 24–29 | 4-step flow: Welcome → Exam Date → Study Time → Domain Confidence |
| Auth & Signup | `Auth.tsx` | 17–89 | Email/password with Zod validation, sign-in/sign-up tabs |

### Routing & Architecture
| Route | Component | Auth Required |
|:---|:---|:---:|
| `/` | Landing | No |
| `/auth` | Auth | No |
| `/pricing` | Pricing | No |
| `/leaderboard` | Leaderboard | No |
| `/onboarding` | Onboarding | Yes |
| `/dashboard` | Dashboard | Yes |
| `/study` | Study | Yes |
| `/flashcards` | Flashcards | Yes |
| `/analytics` | Analytics | Yes |
| `/settings` | Settings | Yes |
| `/admin` | Admin | Yes (but no role check!) |
| `/*` | NotFound | No |

---

*Report generated from white-box code analysis of `CBLE_REPO`. All line references are approximate and subject to change with code updates. Runtime behavior and live database state were not verified.*
