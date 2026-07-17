/**
 * Registers IntersectionObserver to trigger entry animations for sections.
 */
export function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    root: null, // Viewport
    rootMargin: '0px',
    threshold: 0 // Trigger as soon as any part is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once visible, stop observing
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => {
    observer.observe(el);
  });
}
