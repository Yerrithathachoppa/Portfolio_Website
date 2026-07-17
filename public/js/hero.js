/**
 * Renders the Hero section of the portfolio.
 * 
 * @param {object} profileData - Profile information from the database
 */
export function renderHero(profileData) {
  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const { name, title, bio, photo_url, resume_url } = profileData || {};

  // Extract short bio line (first sentence of bio or generic line)
  const shortBio = bio ? bio.split('.')[0] + '.' : 'Finance Professional & Data Specialist';

  // Use a placeholder avatar image if photo_url is not set
  const avatarSrc = photo_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=ychoppa&backgroundColor=00a896';

  heroSection.innerHTML = `
    <div class="container hero-container">
      <div class="hero-content">
        <span class="hero-greeting">Hi there, I am</span>
        <h1 class="hero-name">${name || 'Yerrithatha Choppa'}</h1>
        <h2 class="hero-title">${title || 'Data Specialist'}</h2>
        <p class="hero-desc">${shortBio}</p>
        <div class="hero-actions">
          <a href="#contact" class="btn btn-primary hero-cta">Let's Connect</a>
          <a href="${resume_url || '#'}" id="resume-btn" class="btn btn-secondary ${!resume_url ? 'tooltip' : ''}" target="${resume_url ? '_blank' : '_self'}">
            View Resume
            ${!resume_url ? '<span class="tooltiptext">Resume coming soon!</span>' : ''}
          </a>
        </div>
      </div>
      <div class="hero-avatar">
        <div class="avatar-ring">
          <img src="${avatarSrc}" alt="${name || 'Profile photo'}" class="avatar-img">
        </div>
      </div>
    </div>
  `;

  // Safe-guard resume click if URL is missing
  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn && !resume_url) {
    resumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
    });
  }
}
