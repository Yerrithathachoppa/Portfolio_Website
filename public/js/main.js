import { initTheme } from './theme.js';
import { getContent } from './api.js';
import { renderHero } from './hero.js';
import { renderAbout } from './about.js';
import { renderExperience } from './experience.js';
import { renderProjects } from './projects.js';
import { renderSkills } from './skills.js';
import { renderContact } from './contact.js';
import { renderFooter } from './footer.js';
import { initScrollAnimations } from './scroll-animations.js';
import { initChatbot } from './chatbot.js';

/**
 * Main application orchestrator running on page load.
 */
async function init() {
  // 1. Initialize Theme Toggling
  initTheme();

  // 2. Fetch data and hydrate components
  try {
    const data = await getContent();

    if (data) {
      renderHero(data.profile);
      renderAbout(data.profile);
      renderExperience(data.experience);
      renderProjects(data.projects);
      renderSkills(data.skills);
      renderContact(data.profile);
      renderFooter(data.profile);
      
      // 3. Initialize scroll-trigger animations after content hydration
      initScrollAnimations();

      // 4. Initialize AI Chatbot Widget
      initChatbot();
    }
  } catch (err) {
    console.error('Application initialization failed:', err);
    showErrorState();
  } finally {
    // Dismiss preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.transform = 'scale(1.05)';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => preloader.remove(), 500);
    }
  }
}

init();

/**
 * Renders a full-page fallback error if data fetching fails.
 */
function showErrorState() {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <section style="min-height: 80vh; display: flex; align-items: center; justify-content: center; text-align: center;">
        <div class="container" style="max-width: 600px;">
          <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--accent);">Failed to Load Portfolio</h2>
          <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem;">
            We had trouble connecting to the database server. Please check your database connection or reload the page.
          </p>
          <a href="mailto:ychoppa123@gmail.com" class="btn btn-primary">Contact Yerrithatha directly</a>
        </div>
      </section>
    `;
  }
}
