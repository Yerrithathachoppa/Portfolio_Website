/**
 * Renders the About section of the portfolio.
 * 
 * @param {object} profileData - Profile information from the database
 */
export function renderAbout(profileData) {
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const { bio } = profileData || {};

  aboutSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">About Me</h2>
      <div class="about-grid">
        <div class="about-card hover-lift">
          <div class="about-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p class="about-bio">${bio || 'Finance professional turned Data Specialist with over a decade of financial data analysis and validation experience.'}</p>
        </div>
      </div>
    </div>
  `;
}
