# CBLETest — The Ultimate Customs Broker License Exam Prep

CBLETest is a premium, AI-enhanced study platform designed specifically for candidates of the US Customs Broker License Examination (CBLE). It leverages advanced learning science, spaced repetition (SM-2), and high-fidelity practice questions to maximize your chances of a first-time pass.

## 🚀 Key Features

- **Adaptive Study Loop**: Dynamic question delivery focusing on your weak areas across all 8 CBLE domains (Classification, Valuation, Entry, Broker Duties, etc.).
- **Spaced Repetition Flashcards**: Powered by the SM-2 algorithm to ensure long-term retention of critical 19 CFR regulations and HTSUS rules.
- **Advanced Readiness Analytics**: Track your "Exam-Ready" score with detailed domain-level breakdowns and trending performance charts.
- **Competitive Leaderboard**: Stay motivated by competing with a community of brokers-to-be.
- **Timed Exam Simulations**: High-fidelity 80-question practice exams mirroring real-world CBLE conditions and timing.
- **Customs-First Design**: A professional, dark-themed interface built for focus and long study sessions.

## 🛠️ Technology Stack

- **Frontend**: React 18 / Vite / TypeScript
- **Styling**: Tailwind CSS / shadcn/ui / Framer Motion
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **Icons**: Lucide React

## 📥 Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Supabase Account

### Installation

1. **Clone the repository**:
   ```sh
   git clone https://github.com/pm-81/cble.git
   cd cble
   ```

2. **Install dependencies**:
   ```sh
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**:
   Apply the migrations found in `supabase/migrations/` to your Supabase project.

5. **Seed the Database**:
   Run the seeding script to populate initial domains, questions, and flashcards:
   ```sh
   npm run seed
   ```

6. **Start the Development Server**:
   ```sh
   npm run dev
   ```

## 📂 Project Structure

- `src/components/`: Reusable UI components and Layout elements.
- `src/hooks/`: Custom React hooks for Auth and Data fetching.
- `src/lib/`: Core libraries including Supabase client and Seeding logic.
- `src/pages/`: Main application views (Dashboard, Study, Analytics, Leaderboard, etc.).
- `src/types/`: TypeScript definitions and Database schemas.
- `supabase/migrations/`: SQL migration files for database version control.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
