// ==================== MODAL CONTROLS ====================

const modal = document.getElementById('submitModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');

// Open modal
openBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

// Close modal
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  document.getElementById('ideaForm').reset();
  document.getElementById('message').textContent = '';
  document.getElementById('message').className = 'message';
}

closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Close on outside click
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    closeModal();
  }
});

// ==================== CHARACTER COUNTER ====================

const descriptionField = document.getElementById('description');
const charCount = document.querySelector('.char-count');

descriptionField.addEventListener('input', () => {
  const length = descriptionField.value.length;
  charCount.textContent = `${length}/500 characters`;
  
  if (length > 450) {
    charCount.style.color = '#ef4444';
  } else {
    charCount.style.color = '#666';
  }
});

// ==================== FORM SUBMISSION ====================

document.getElementById('ideaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageDiv = document.getElementById('message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Get form data
  const formData = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    submitted_by: document.getElementById('name').value.trim(),
    status: 'pending'
  };

  // Validate
  if (!formData.title || !formData.description || !formData.submitted_by) {
    messageDiv.className = 'message error';
    messageDiv.textContent = '✗ Please fill in all fields.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const { data, error } = await supabase
      .from('ideas')
      .insert([formData])
      .select();

    if (error) throw error;

    messageDiv.className = 'message success';
    messageDiv.textContent = 
      '✓ Success! Your idea will appear after admin approval.';
    
    document.getElementById('ideaForm').reset();
    charCount.textContent = '0/500 characters';

    // Close modal after 2 seconds
    setTimeout(() => {
      closeModal();
    }, 2000);

  } catch (error) {
    console.error('Error submitting idea:', error);
    messageDiv.className = 'message error';
    messageDiv.textContent = '✗ Error submitting idea. Please try again.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Idea';
  }
});

// ==================== LOAD & DISPLAY IDEAS ====================

let userUpvotes = JSON.parse(localStorage.getItem('upvoted_ideas')) || [];

// Load ideas on page load
loadIdeas();

async function loadIdeas() {
  const container = document.getElementById('ideas-container');
  const loading = document.getElementById('loading');
  const noIdeas = document.getElementById('no-ideas');

  try {
    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('status', 'approved')
      .order('upvote_count', { ascending: false });

    loading.style.display = 'none';

    if (error) throw error;

    if (!ideas || ideas.length === 0) {
      noIdeas.style.display = 'block';
      return;
    }

    container.innerHTML = ideas.map(idea => createIdeaCard(idea)).join('');

    // Add upvote listeners
    document.querySelectorAll('.upvote-btn').forEach(btn => {
      btn.addEventListener('click', handleUpvote);
    });

  } catch (error) {
    console.error('Error loading ideas:', error);
    loading.textContent = 'Error loading ideas. Please refresh the page.';
  }
}

function createIdeaCard(idea) {
  const hasUpvoted = userUpvotes.includes(idea.id);
  
  return `
    <div class="idea-card">
      <div class="idea-header">
        <h3>${escapeHtml(idea.title)}</h3>
        <div class="upvote-section">
          <button 
            class="upvote-btn ${hasUpvoted ? 'upvoted' : ''}" 
            data-idea-id="${idea.id}"
            ${hasUpvoted ? 'disabled' : ''}
            title="${hasUpvoted ? 'Already upvoted' : 'Upvote this idea'}"
          >
            ${hasUpvoted ? '✓' : '↑'}
          </button>
          <span class="upvote-count">${idea.upvote_count}</span>
        </div>
      </div>
      
      <p class="description">${escapeHtml(idea.description)}</p>
      
      <div class="idea-footer">
        <span class="submitter">by ${escapeHtml(idea.submitted_by)}</span>
        <span class="date">${formatDate(idea.created_at)}</span>
      </div>
    </div>
  `;
}

// ==================== UPVOTING ====================

async function handleUpvote(e) {
  const btn = e.target;
  const ideaId = btn.dataset.ideaId;
  const userIdentifier = getUserIdentifier();

  if (userUpvotes.includes(ideaId)) {
    showToast('You already upvoted this idea!', 'error');
    return;
  }

  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '...';

  try {
    // Insert upvote
    const { error: upvoteError } = await supabase
      .from('upvotes')
      .insert([{ idea_id: ideaId, user_identifier: userIdentifier }]);

    if (upvoteError) {
      if (upvoteError.code === '23505') {
        showToast('You already upvoted this idea!', 'error');
        return;
      }
      throw upvoteError;
    }

    // Get current count
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('upvote_count')
      .eq('id', ideaId)
      .single();

    if (fetchError) throw fetchError;

    // Increment count
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ upvote_count: idea.upvote_count + 1 })
      .eq('id', ideaId);

    if (updateError) throw updateError;

    // Update UI
    userUpvotes.push(ideaId);
    localStorage.setItem('upvoted_ideas', JSON.stringify(userUpvotes));
    
    btn.textContent = '✓';
    btn.classList.add('upvoted');
    
    const countSpan = btn.nextElementSibling;
    countSpan.textContent = idea.upvote_count + 1;

    showToast('Upvoted! 🎉', 'success');

  } catch (error) {
    console.error('Error upvoting:', error);
    showToast('Error upvoting. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
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
    year: 'numeric' 
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}