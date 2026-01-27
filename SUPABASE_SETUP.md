# CBLE Prep - Supabase Setup Guide

## Overview
This guide will help you set up a new Supabase project for the CBLE Prep application.

## Prerequisites
- Node.js 18+ installed
- Supabase account (https://supabase.com)

## Step 1: Create a New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the details:
   - **Name**: `cble-prep` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
4. Click "Create new project"
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get Your Project Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Update Environment Variables

Create or update `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://qumyfpvtmjsdqqldxfxu.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_9DGKuWcF8jpIVMc4mrsCOA_CHHCyxF0
```

**Important**: Never commit the `.env` file to git!

## Step 4: Run Database Migrations

The database schema is already defined in `supabase/migrations/`. To apply it:

### Option A: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to **SQL Editor** in your Supabase dashboard
2. Open the migration file: `supabase/migrations/20260125211707_6b5d4a9d-7ce9-44ed-8f4d-a0ca74a08030.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run"

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
npx supabase link --project-ref your-project-id

# Push migrations
npx supabase db push
```

## Step 5: Seed the Database

After migrations are applied, seed sample data:

```bash
# Install dependencies (if not already done)
npm install

# Run the seed script (we'll create a command for this)
npm run seed
```

## Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `profiles`
   - `domains`
   - `questions`
   - `flashcards`
   - `question_attempts`
   - `flashcard_progress`
   - `user_streaks`
   - And more...

3. Check that domains are populated (should have 8 rows)
4. Check that questions are populated (should have sample questions)

## Step 7: Test the Application

```bash
# Start the dev server
npm run dev
```

Visit `http://localhost:5173` and:
1. Click "Sign Up"
2. Create an account
3. Complete onboarding
4. Try a study session

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct values
- Make sure you're using the **anon/public** key, not the service role key
- Restart the dev server after changing `.env`

### "No questions available"
- Run the seed script
- Check the Supabase dashboard to verify data was inserted
- Check browser console for errors

### RLS Policy errors
- Ensure migrations were applied correctly
- Check that you're logged in (auth state)
- Verify RLS policies in Supabase dashboard under **Authentication** → **Policies**

## Next Steps

Once setup is complete, you can:
- Add more questions via the seed script
- Create an admin panel for content management
- Deploy to production (Vercel + Supabase production project)

## Production Deployment

For production:
1. Create a separate Supabase project for production
2. Set up environment variables in Vercel/Netlify
3. Run migrations on production database
4. Seed production data
5. Enable email confirmations in Supabase Auth settings
