import { openModal } from './modal.js';

/**
 * Renders the Projects grid section.
 * 
 * @param {Array} projectsList - List of projects ordered by sort_order
 */
export function renderProjects(projectsList) {
  const projectsSection = document.getElementById('projects');
  if (!projectsSection) return;

  if (!projectsList || projectsList.length === 0) {
    projectsSection.innerHTML = '';
    return;
  }

  const cardsHtml = projectsList
    .map(proj => {
      const techChips = Array.isArray(proj.tech)
        ? proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')
        : '';

      // Default thumbnail image if null
      const thumbUrl = proj.thumbnail_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&h=250&q=80';

      return `
        <div class="project-card hover-lift" data-id="${proj.id}">
          <div class="project-image">
            <img src="${thumbUrl}" alt="${proj.title}" loading="lazy">
            <div class="project-overlay">
              <a href="${proj.project_url || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary view-details-btn">View Project</a>
            </div>
          </div>
          <div class="project-info">
            <h3 class="project-card-title">${proj.title}</h3>
            <p class="project-card-desc">${proj.description}</p>
            <div class="project-tech-tags">
              ${techChips}
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  projectsSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        ${cardsHtml}
      </div>
    </div>
  `;

  // Attach click listeners to cards to open modal details
  const cards = projectsSection.querySelectorAll('.project-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If clicking the direct view link, bypass opening the modal
      if (e.target.closest('.view-details-btn')) {
        return;
      }
      const projId = parseInt(card.getAttribute('data-id'), 10);
      const project = projectsList.find(p => p.id === projId);
      if (project) {
        openModal(project);
      }
    });
  });
}
