// Supabase configuration
const SUPABASE_URL = 'https://hpfvflxdmsqbvchgfkiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZnZmbHhkbXNxYnZjaGdma2l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDgxNDQsImV4cCI6MjA3NjA4NDE0NH0.7xkC433PFuQwFhLQyeeFzHeX4cyTbAQ5Be5afVsw4Ic';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get user identifier (for upvoting)
function getUserIdentifier() {
  let identifier = localStorage.getItem('user_id');
  if (!identifier) {
    // Generate a unique identifier for this browser
    identifier = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('user_id', identifier);
  }
  return identifier;
}