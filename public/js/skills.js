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

  // Group skills by category
  const categories = {
    technical: { title: 'Technical Skills', list: [] },
    tools: { title: 'Tools & Platforms', list: [] },
    soft: { title: 'Soft Skills', list: [] }
  };

  skillsList.forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category].list.push(skill.name);
    }
  });

  const categoriesHtml = Object.keys(categories)
    .map(key => {
      const cat = categories[key];
      if (cat.list.length === 0) return '';
      
      const chips = cat.list
        .map(skillName => `<span class="skill-chip hover-lift">${skillName}</span>`)
        .join('');

      return `
        <div class="skills-category-card">
          <h3 class="skills-category-title">${cat.title}</h3>
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
