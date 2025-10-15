# FikirBAL 💡

A simple idea submission platform where students share project ideas, admins approve them, and everyone votes for the best ones.

## Overview

FikirBAL allows students to:
- Submit project ideas through a clean modal interface
- Browse and upvote approved ideas
- See the most popular ideas rise to the top

Admins can:
- Review pending submissions
- Approve or reject ideas
- Manage the content quality

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JavaScript (no frameworks or build tools)
- **Backend/Database:** Supabase (handles database, authentication, and Row Level Security)
- **Deployment:** Netlify or Vercel (drag & drop deployment)

## Features

### For Students
- **Easy Submission:** Click "Got a project idea?" button to open submission modal
- **Browse Ideas:** Scroll down to see all approved project ideas
- **Upvoting:** Vote for your favorite ideas (limited to prevent spam)
- **Real-time Updates:** See upvote counts update instantly

### For Admins
- **Review Dashboard:** See all pending submissions in one place
- **Quick Actions:** Approve or reject ideas with one click
- **Secure Access:** Protected by authentication

### Technical Features
- **Row Level Security (RLS):** Database policies prevent unauthorized access
- **Rate Limiting:** Users can't spam upvotes
- **Duplicate Prevention:** Can't upvote the same idea twice
- **Responsive Design:** Works on mobile, tablet, and desktop

## Database Schema

### Tables

**ideas**
- `id` (UUID, primary key)
- `title` (TEXT, required)
- `description` (TEXT, required)
- `submitted_by` (TEXT, required)
- `status` (TEXT, default 'pending') - 'pending' | 'approved' | 'rejected'
- `upvote_count` (INTEGER, default 0)
- `created_at` (TIMESTAMP)

**upvotes**
- `id` (UUID, primary key)
- `idea_id` (UUID, foreign key → ideas.id)
- `user_identifier` (TEXT, required)
- `created_at` (TIMESTAMP)
- UNIQUE constraint on (idea_id, user_identifier)

## Setup Instructions

### 1. Supabase Setup (15 minutes)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the SQL schema** (provided in setup documentation)
   - Creates `ideas` and `upvotes` tables
   - Sets up Row Level Security policies
   - Creates indexes for performance

3. **Create admin user**
   - Go to Authentication → Add User
   - Enter admin email and password
   - This user will access the admin panel

4. **Get API credentials**
   - Settings → API
   - Copy Project URL and anon/public key
   - Add them to `js/config.js`

### 2. Local Development

1. Clone the repository
2. Open `js/config.js` and add your Supabase credentials
3. Open `index.html` in a browser (or use Live Server in VS Code)
4. Test submission and upvoting

### 3. Deployment (5 minutes)

**Option A: Netlify**
1. Drag the project folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Done! Your site is live

**Option B: Vercel**
1. Import the GitHub repo to [vercel.com](https://vercel.com)
2. Click Deploy
3. Done!

**Option C: GitHub Pages**
1. Push to GitHub
2. Settings → Pages → Deploy from main branch
3. Wait 1-2 minutes for deployment

## File Responsibilities

### Frontend Team
- **index.html** - Main page structure with modal and ideas feed
- **login.html** - Admin login form
- **admin.html** - Admin dashboard layout
- **styles.css** - All styling and responsive design

### Backend/Logic Team
- **js/config.js** - Supabase configuration
- **js/main.js** - Homepage functionality (submissions + browsing + upvoting)
- **js/admin.js** - Admin panel logic (review + approve/reject)

## User Flow

### Submitting an Idea
1. Click "Got a project idea?" button
2. Fill out the modal form (title, description, name)
3. Click Submit
4. Idea goes to pending status (admin review)

### Browsing & Upvoting
1. Scroll down homepage to see approved ideas
2. Ideas sorted by upvote count (most popular first)
3. Click upvote button (can only upvote once per idea)
4. Count updates in real-time

### Admin Review
1. Admin logs in via `/login.html`
2. Redirected to admin dashboard
3. See all pending ideas
4. Click Approve or Reject
5. Approved ideas appear on homepage

## Security Features

- **RLS Policies:** Prevent direct database manipulation
- **Auth Protection:** Admin panel requires login
- **Upvote Limits:** Browser fingerprinting prevents spam
- **Input Validation:** Forms validated before submission
- **SQL Injection Protection:** Supabase handles all queries safely

## Development Timeline

- **Phase 1:** Supabase setup (15 min)
- **Phase 2:** Build pages (1 hour)
- **Phase 3:** Implement features (45 min)
- **Phase 4:** Polish & test (20 min)
- **Phase 5:** Deploy (5 min)

**Total: ~2 hours**

## Team Roles

### Project Lead (You)
- Set up Supabase
- Configure RLS policies
- Implement core JS logic
- Coordinate team

### Frontend Developer 1
- Build modal HTML/CSS
- Style submission form
- Make it responsive

### Frontend Developer 2
- Build ideas feed layout
- Style idea cards
- Add animations

### Frontend Developer 3
- Build admin dashboard
- Style admin actions
- Polish login page

### Designer
- Create cohesive design system
- Add school branding/colors
- Ensure mobile responsiveness
- Polish all UI elements

## Testing Checklist

- [ ] Submit an idea → appears in admin panel
- [ ] Approve idea → shows on homepage
- [ ] Upvote idea → count increases
- [ ] Try to upvote twice → blocked
- [ ] Mobile responsive → works on phone
- [ ] Admin