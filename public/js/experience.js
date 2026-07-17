/**
 * Renders the Experience timeline section of the portfolio.
 * 
 * @param {Array} experienceList - List of experiences ordered by sort_order
 */
export function renderExperience(experienceList) {
  const expSection = document.getElementById('experience');
  if (!expSection) return;

  if (!experienceList || experienceList.length === 0) {
    expSection.innerHTML = '';
    return;
  }

  const timelineHtml = experienceList
    .map((exp, index) => {
      const isEven = index % 2 === 0;
      const bulletsHtml = Array.isArray(exp.bullets)
        ? exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')
        : '';
      
      const dateString = exp.end_date 
        ? `${exp.start_date} – ${exp.end_date}`
        : `${exp.start_date} – Present`;

      return `
        <div class="timeline-item ${isEven ? 'left' : 'right'}">
          <div class="timeline-dot"></div>
          <div class="timeline-card hover-lift">
            <span class="timeline-date">${dateString}</span>
            <h3 class="timeline-role">${exp.role}</h3>
            <h4 class="timeline-company">${exp.company}</h4>
            <ul class="timeline-bullets">
              ${bulletsHtml}
            </ul>
          </div>
        </div>
      `;
    })
    .join('');

  expSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Professional Experience</h2>
      <div class="timeline-container">
        <div class="timeline-line"></div>
        ${timelineHtml}
      </div>
    </div>
  `;
}
