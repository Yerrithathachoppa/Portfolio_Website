/**
 * Renders the Services section of the portfolio.
 *
 * @param {Array} servicesList - List of { title, description } services
 */
export function renderServices(servicesList) {
  const servicesSection = document.getElementById('services');
  if (!servicesSection) return;

  if (!servicesList || servicesList.length === 0) {
    servicesSection.innerHTML = '';
    servicesSection.style.display = 'none';
    return;
  }

  const cards = servicesList
    .map((service, i) => `
      <div class="service-card hover-lift">
        <span class="service-number">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="service-title">${service.title}</h3>
        <p class="service-desc">${service.description}</p>
      </div>
    `)
    .join('');

  servicesSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">Services</h2>
      <p class="services-subtitle">Freelance and contract work for investment firms, lenders, fintechs, and finance teams.</p>
      <div class="services-grid">
        ${cards}
      </div>
      <div class="services-cta">
        <a href="#contact" class="btn btn-primary">Discuss Your Project</a>
      </div>
    </div>
  `;
}
