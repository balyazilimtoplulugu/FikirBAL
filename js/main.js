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
  document.querySelector('.char-count').textContent = '0/500 karakter';
  document.querySelector('.char-count').style.color = '#666';
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
  charCount.textContent = `${length}/500 karakter`;
  
  if (length > 450) {
    charCount.style.color = '#ef4444';
  } else {
    charCount.style.color = '#666';
  }
});

// ==================== FORM SUBMISSION (FIXED VERSION) ====================

document.getElementById('ideaForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const messageDiv = document.getElementById('message');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  // Get form data with user identifier
  const formData = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    submitted_by: document.getElementById('name').value.trim(),
    status: 'pending',
    user_identifier: getUserIdentifier() // Track who submitted this
  };

  // Validate
  if (!formData.title || !formData.description || !formData.submitted_by) {
    messageDiv.className = 'message error';
    messageDiv.textContent = '✗ Lütfen tüm alanları doldurun.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';

  try {
    // Check submission limit first
    const { data: userIdeas, error: countError } = await supabase
      .from('ideas')
      .select('id')
      .eq('user_identifier', formData.user_identifier);

    if (countError) throw countError;

    if (userIdeas && userIdeas.length >= 5) {
      messageDiv.className = 'message error';
      messageDiv.textContent = '✗ En fazla 5 fikir gönderme limitine ulaştınız.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Fikrini Gönder';
      return;
    }

    // Submit the idea (FIXED - don't expect data back)
    const { error } = await supabase
      .from('ideas')
      .insert([formData]);

    if (error) throw error;

    // Success!
    messageDiv.className = 'message success';
    messageDiv.textContent = 
      '✓ Başarılı! Fikriniz yönetici onayından sonra görünecektir.';
    
    document.getElementById('ideaForm').reset();
    charCount.textContent = '0/500 karakter';

    // Close modal after 2 seconds
    setTimeout(() => {
      closeModal();
    }, 2000);

  } catch (error) {
    console.error('Error submitting idea:', error);
    messageDiv.className = 'message error';
    messageDiv.textContent = '✗ Fikir gönderilirken hata oluştu. Lütfen tekrar deneyin.';
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Fikrini Gönder';
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
    loading.textContent = 'Fikirler yüklenirken hata oluştu. Sayfayı yenileyin.';
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
            class="upvote-btn ${hasUpvoted ? 'voted' : 'unvoted'}" 
            data-idea-id="${idea.id}"
            title="${hasUpvoted ? 'Oyu geri al' : 'Bu fikre oy ver'}"
          >
            ${hasUpvoted ? '✓' : '↑'}
          </button>
          <span class="upvote-count">${idea.upvote_count}</span>
        </div>
      </div>
      
      <p class="description">${escapeHtml(idea.description)}</p>
      
      <div class="idea-footer">
        <span class="submitter">${escapeHtml(idea.submitted_by)} tarafından gönderildi</span>
        <span class="date">${formatDate(idea.created_at)}</span>
      </div>
    </div>
  `;
}

// ==================== UPVOTING (UNVOTE İLE GÜNCELLENMİŞ) ====================

async function handleUpvote(e) {
  const btn = e.target;
  const ideaId = btn.dataset.ideaId;
  const userIdentifier = getUserIdentifier();
  const isCurrentlyUpvoted = userUpvotes.includes(ideaId);
  
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '...';

  try {
    if (isCurrentlyUpvoted) {
      // UNVOTE - Remove the upvote
      const { error: deleteError } = await supabase
        .from('upvotes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('user_identifier', userIdentifier);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Get current count
      const { data: idea, error: fetchError } = await supabase
        .from('ideas')
        .select('upvote_count')
        .eq('id', ideaId)
        .single();

      if (fetchError) throw fetchError;

      // Decrement count
      const { error: updateError } = await supabase
        .from('ideas')
        .update({ upvote_count: Math.max(0, idea.upvote_count - 1) })
        .eq('id', ideaId);

      if (updateError) throw updateError;

      // Update UI
      userUpvotes = userUpvotes.filter(id => id !== ideaId);
      localStorage.setItem('upvoted_ideas', JSON.stringify(userUpvotes));
      
      btn.textContent = '↑';
      btn.classList.remove('voted');
      btn.classList.add('unvoted');
      
      const countSpan = btn.nextElementSibling;
      countSpan.textContent = Math.max(0, idea.upvote_count - 1);

      showToast("Oyunuz geri alındı!", 'info');

    } else {
      // UPVOTE - Add the upvote
      const { error: upvoteError } = await supabase
        .from('upvotes')
        .insert([{ idea_id: ideaId, user_identifier: userIdentifier }]);

      if (upvoteError) {
        if (upvoteError.code === '23505') {
          showToast('Bu fikri zaten oyladınız!', 'error');
          userUpvotes.push(ideaId);
          localStorage.setItem('upvoted_ideas', JSON.stringify(userUpvotes));
          btn.textContent = '✓';
          btn.classList.add('voted');
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
      btn.classList.remove('unvoted');
      btn.classList.add('voted');
      
      const countSpan = btn.nextElementSibling;
      countSpan.textContent = idea.upvote_count + 1;

      showToast('Oyladınız! 🎉', 'success');
    }

  } catch (error) {
    console.error('Error handling vote:', error);
    showToast('Oylama hatası. Lütfen tekrar deneyin.', 'error');
    btn.disabled = false;
    btn.textContent = originalText;
  } finally {
    btn.disabled = false;
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
  return date.toLocaleDateString('tr-TR', { 
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

  // Show toast with animation
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}