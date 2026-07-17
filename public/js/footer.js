/**
 * Renders the Footer section of the portfolio.
 * 
 * @param {object} profileData - Profile information containing name
 */
export function renderFooter(profileData) {
  const footerElement = document.getElementById('footer');
  if (!footerElement) return;

  const name = (profileData && profileData.name) || 'Yerrithatha Choppa';
  const currentYear = new Date().getFullYear();

  footerElement.innerHTML = `
    <div class="container footer-container">
      <div class="footer-left">
        <a href="#hero" class="footer-logo">Yerrithatha<span>.</span></a>
        <p class="footer-tagline">Data Specialist | Automating Financial Data Flows</p>
      </div>
      <div class="footer-right">
        <p class="copyright">&copy; ${currentYear} ${name}. All rights reserved.</p>
      </div>
    </div>
  `;
}
