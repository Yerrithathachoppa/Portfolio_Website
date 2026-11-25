/**
 * Renders the Skills section of the portfolio.
 * Groups skills by category and displays them as tag grids.
 *
 * @param {Array} skillsList - List of skills ordered by sort_order
 */
export function renderSkills(skillsList) {
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  if (!skillsList || skillsList.length === 0) {
    skillsSection.innerHTML = '';
    return;
  }

  // Group skills by category, keeping the order they appear in profile.md
  const legacyTitles = { technical: 'Technical Skills', tools: 'Tools & Platforms', soft: 'Soft Skills' };
  const categories = new Map();
  skillsList.forEach(skill => {
    const title = legacyTitles[skill.category] || skill.category;
    if (!categories.has(title)) categories.set(title, []);
    categories.get(title).push(skill.name);
  });

  const categoriesHtml = Array.from(categories.entries())
    .map(([title, list]) => {
      if (list.length === 0) return '';

      const chips = list
        .map(skillName => `<span class="skill-chip hover-lift">${skillName}</span>`)
        .join('');

      return `
        <div class="skills-category-card">
          <h3 class="skills-category-title">${title}</h3>
          <div class="skills-chips-grid">
            ${chips}
          </div>
        </div>
      `;
    })
    .join('');

  skillsSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Skills & Expertise</h2>
      <div class="skills-grid">
        ${categoriesHtml}
      </div>
    </div>
  `;
}
