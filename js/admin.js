// ==================== AUTHENTICATION CHECK ====================

// Check if user is logged in on page load
checkAuth();

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // Not logged in, redirect to login page
    window.location.href = 'login.html';
    return;
  }
  
  // User is authenticated, load pending ideas
  loadPendingIdeas();
}

// Logout button
document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// ==================== LOAD PENDING IDEAS ====================

async function loadPendingIdeas() {
  const container = document.getElementById('ideas-container');
  const loading = document.getElementById('loading');
  const noIdeas = document.getElementById('no-ideas');

  try {
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    loading.style.display = 'none';

    if (error) throw error;

    if (!ideas || ideas.length === 0) {
      noIdeas.style.display = 'block';
      return;
    }

    container.innerHTML = ideas.map(idea => createAdminCard(idea)).join('');

    // Add event listeners
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => handleApproval(btn.dataset.ideaId, 'approved'));
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => handleApproval(btn.dataset.ideaId, 'rejected'));
    });

  } catch (error) {
    console.error('Error loading ideas:', error);
    loading.textContent = 'Error loading ideas. Please refresh.';
  }
}

function createAdminCard(idea) {
  return `
    <div class="admin-card" id="idea-${idea.id}">
      <div class="admin-card-header">
        <h3>${escapeHtml(idea.title)}</h3>
        <span class="date">${formatDate(idea.created_at)}</span>
      </div>
      <p class="description">${escapeHtml(idea.description)}</p>
      <p class="submitter">Submitted by: <strong>${escapeHtml(idea.submitted_by)}</strong></p>
      <div class="admin-actions">
        <button class="approve-btn" data-idea-id="${idea.id}">
          ✓ Approve
        </button>
        <button class="reject-btn" data-idea-id="${idea.id}">
          ✗ Reject
        </button>
      </div>
    </div>
  `;
}

// ==================== HANDLE APPROVAL/REJECTION ====================

async function handleApproval(ideaId, newStatus) {
  const card = document.getElementById(`idea-${ideaId}`);
  
  try {
    const { error } = await supabase
      .from('ideas')
      .update({ status: newStatus })
      .eq('id', ideaId);

    if (error) throw error;

    // Remove card with animation
    card.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      card.remove();
      
      // Check if there are any cards left
      const remaining = document.querySelectorAll('.admin-card').length;
      if (remaining === 0) {
        document.getElementById('no-ideas').style.display = 'block';
      }
    }, 300);

  } catch (error) {
    console.error('Error updating idea:', error);
    alert('Error updating idea. Please try again.');
  }
}

// ==================== HELPER FUNCTIONS ====================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}