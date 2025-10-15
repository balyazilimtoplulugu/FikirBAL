Alright, let me lay out the full game plan for FikirBAL:

## Project Overview
A simple idea submission platform where students submit project ideas, admins approve them, and everyone can upvote the good ones.

## Tech Stack
- **Frontend:** Plain HTML/CSS/JS (no build tools, no frameworks)
- **Backend/DB:** Supabase (handles everything - database, auth, RLS)
- **Deployment:** Netlify or Vercel (just drag & drop the folder)

## Step-by-Step Plan

### **Phase 1: Supabase Setup (15 min)**

1. **Create tables in Supabase SQL Editor:**
   - `ideas` table (id, title, description, submitted_by, status, created_at, upvote_count)
   - `upvotes` table (id, idea_id, user_ip, created_at) - tracks who upvoted what
   - Set up RLS policies so people can't mess with the database

2. **Create admin user:**
   - Go to Supabase Auth → Create a user with admin email
   - This person can approve/reject ideas

3. **Get your credentials:**
   - Copy Supabase project URL + anon key
   - Put them in your JS files (yes, they're safe to expose with RLS)

### **Phase 2: Build the Pages (1-1.5 hours)**

**File structure:**
```
FikirBAL/
├── index.html          → Submit new ideas
├── browse.html         → View approved ideas + upvote
├── admin.html          → Admin dashboard (approve/reject)
├── login.html          → Admin login page
├── styles.css          → Shared styling
└── js/
    ├── config.js       → Supabase credentials
    ├── submit.js       → Handle idea submissions
    ├── browse.js       → Display ideas + upvoting
    └── admin.js        → Admin approval logic
```

**Pages to build:**

1. **index.html** - Idea submission form
   - Form with: title, description, your name
   - Submits to Supabase `ideas` table with status='pending'
   - Success message after submission

2. **browse.html** - Public gallery of approved ideas
   - Fetch all ideas where status='approved'
   - Display as cards with title, description, upvote count
   - Upvote button (checks localStorage to see if already upvoted)
   - Sort by upvote count (most popular first)

3. **login.html** - Simple admin login
   - Email + password form
   - Uses Supabase Auth to sign in
   - Redirects to admin.html if successful

4. **admin.html** - Admin dashboard
   - Check if user is logged in (if not, redirect to login)
   - Fetch all ideas where status='pending'
   - Show approve/reject buttons for each
   - Update status in Supabase when clicked

### **Phase 3: Implement Features (30-45 min)**

**Upvote system:**
- Click upvote → check localStorage if they've already upvoted this idea
- If not → insert into `upvotes` table with their IP (get IP from a service or just use a fingerprint)
- Increment `upvote_count` on the idea
- Save to localStorage so button shows "Upvoted ✓"

**IP rate limiting:**
- Store IP in `upvotes` table
- Before allowing upvote, count how many upvotes this IP has made
- If > 10, show error "You've reached your upvote limit!"

**Admin features:**
- Approve button → update idea status to 'approved'
- Reject button → update idea status to 'rejected'
- Only show pending ideas in admin panel

### **Phase 4: Polish & Deploy (20 min)**

1. **Styling:**
   - Make it look decent with CSS (clean cards, nice buttons, responsive)
   - Add some color/branding with BAL school colors if you have them

2. **Test everything:**
   - Submit an idea → check if it appears in admin panel
   - Approve it → check if it shows on browse page
   - Upvote → check if count increases and button disables
   - Try to upvote again → should be blocked

3. **Deploy:**
   - Push to GitHub
   - Connect repo to Netlify/Vercel
   - Done! Live site in 2 minutes

### **Phase 5: Presentation Prep (10 min)**
- Write a quick README explaining the project
- Take screenshots of each page
- Prepare talking points: "We built this so students can share project ideas and vote on the best ones"

## What Your Students Will Do

While you're setting up Supabase and the structure:
- They can work on the HTML structure of pages
- They can style with CSS (make it pretty!)
- They can test and find bugs
- They can add content (seed some example ideas)

You handle:
- Supabase setup and schema
- RLS policies
- The JS logic for data fetching/updating

## Time Estimate
- Supabase setup: 15 min
- Building pages: 1 hour
- Features: 45 min
- Polish: 20 min
- **Total: ~2 hours** (matches your estimate!)

---

Ready to start? Want me to give you the SQL for the tables first?