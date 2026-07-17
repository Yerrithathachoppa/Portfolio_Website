const files = [
  '/js/theme.js',
  '/js/api.js',
  '/js/hero.js',
  '/js/about.js',
  '/js/experience.js',
  '/js/projects.js',
  '/js/skills.js',
  '/js/contact.js',
  '/js/footer.js',
  '/js/scroll-animations.js',
  '/js/chatbot.js',
  '/js/speech.js'
];

async function check() {
  for (const file of files) {
    const res = await fetch(`http://localhost:3000${file}`);
    console.log(`${file}: ${res.status} (${res.headers.get('content-type')})`);
  }
}

check();
