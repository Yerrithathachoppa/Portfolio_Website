let activeElementBeforeModal = null;

/**
 * Opens and renders the project details modal.
 * Implements WAI-ARIA modal accessibility.
 * 
 * @param {object} project - Selected project data
 */
export function openModal(project) {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  // Save the currently focused element to restore it later
  activeElementBeforeModal = document.activeElement;

  const techChips = Array.isArray(project.tech)
    ? project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')
    : '';

  const linksHtml = [];
  if (project.project_url) {
    linksHtml.push(`
      <a href="${project.project_url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        Visit Live Project
      </a>
    `);
  }
  if (project.video_url) {
    const isGithub = project.video_url.includes('github.com') || project.video_url.includes('github');
    linksHtml.push(`
      <a href="${project.video_url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        ${isGithub ? 'View GitHub Code' : 'Watch Demo Video'}
      </a>
    `);
  }

  const thumbUrl = project.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&h=450&q=80';

  modal.innerHTML = `
    <div class="modal-overlay" tabindex="-1">
      <div class="modal-card" role="document">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <div class="modal-image">
          <img src="${thumbUrl}" alt="${project.title}">
        </div>
        <div class="modal-content">
          <h3 class="modal-title">${project.title}</h3>
          <div class="modal-tech">
            ${techChips}
          </div>
          <p class="modal-desc">${project.description}</p>
          <div class="modal-actions">
            ${linksHtml.join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Update ARIA attributes
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling

  // Attach Close Handlers
  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore background scrolling
    
    // Clean up event listeners
    window.removeEventListener('keydown', handleKeyDown);
    
    // Restore focus to original trigger element
    if (activeElementBeforeModal) {
      activeElementBeforeModal.focus();
    }
  }

  closeBtn.addEventListener('click', closeModal);
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Focus Trapping and Keyboard Escape Close
  const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(modal.querySelectorAll(focusableElementsString));
  const firstFocusableElement = focusableElements[0];
  const lastFocusableElement = focusableElements[focusableElements.length - 1];

  if (firstFocusableElement) {
    firstFocusableElement.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      // Focus Trap Loop
      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        }
      } else { // Tab
        if (document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown);
}
export { activeElementBeforeModal };
