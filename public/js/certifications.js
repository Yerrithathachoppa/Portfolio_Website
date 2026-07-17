/**
 * Renders the Certifications section cards dynamically.
 * 
 * @param {Array} certificationsList List of certifications objects
 */
export function renderCertifications(certificationsList) {
  const certsSection = document.getElementById('certifications');
  if (!certsSection) return;

  if (!certificationsList || certificationsList.length === 0) {
    certsSection.style.display = 'none';
    return;
  }

  // Sort certifications by sort_order
  const sortedCerts = [...certificationsList].sort((a, b) => a.sort_order - b.sort_order);

  const cardsHtml = sortedCerts
    .map(cert => {
      return `
        <a href="${cert.url || '#'}" target="_blank" rel="noopener noreferrer" class="cert-card hover-lift">
          <div class="cert-icon-wrapper">
            <svg class="cert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
          </div>
          <div class="cert-info">
            <h3 class="cert-title">${cert.name}</h3>
            <div class="cert-verify-label">
              Verify Credential
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  certsSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Certifications</h2>
      <div class="certifications-grid">
        ${cardsHtml}
      </div>
    </div>
  `;
}
