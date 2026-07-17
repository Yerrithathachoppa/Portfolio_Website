/**
 * Full diagnostic script: checks server responses, HTML content,
 * API response time, and identifies potential issues.
 */
async function diagnose() {
  console.log('=== PORTFOLIO WEBSITE DIAGNOSTIC ===\n');

  // 1. Check landing page HTML
  console.log('--- 1. Landing Page HTML ---');
  const htmlRes = await fetch('http://localhost:3000/');
  const html = await htmlRes.text();
  console.log('Status:', htmlRes.status);
  console.log('Content-Type:', htmlRes.headers.get('content-type'));
  console.log('HTML length:', html.length);
  console.log('Has <script type="module">:', html.includes('type="module"'));
  console.log('Has src="/js/main.js":', html.includes('src="/js/main.js"'));
  console.log('Has <section id="hero":', html.includes('id="hero"'));
  console.log('Has class="reveal":', html.includes('class="reveal"'));

  // 2. Check API /content response
  console.log('\n--- 2. API /content ---');
  const t0 = Date.now();
  const apiRes = await fetch('http://localhost:3000/api/content');
  const elapsed = Date.now() - t0;
  console.log('Status:', apiRes.status);
  console.log('Response time:', elapsed, 'ms');
  const apiData = await apiRes.json();
  console.log('Keys:', Object.keys(apiData));
  console.log('Profile name:', apiData.profile?.name);
  console.log('Experience count:', apiData.experience?.length);
  console.log('Projects count:', apiData.projects?.length);
  console.log('Skills count:', apiData.skills?.length);
  console.log('FAQ count:', apiData.faq?.length);
  console.log('Is fallback:', apiData.is_fallback);

  // 3. Check all JS modules load successfully
  console.log('\n--- 3. JS Module Loading ---');
  const jsFiles = [
    'main.js', 'theme.js', 'api.js', 'hero.js', 'about.js',
    'experience.js', 'projects.js', 'skills.js', 'contact.js',
    'footer.js', 'scroll-animations.js', 'chatbot.js', 'modal.js', 'speech.js'
  ];
  for (const f of jsFiles) {
    const r = await fetch(`http://localhost:3000/js/${f}`);
    const ct = r.headers.get('content-type');
    const body = await r.text();
    // Check for import statements to verify it's real JS
    const hasExport = body.includes('export');
    console.log(`  ${f}: ${r.status} | ${ct} | ${body.length} bytes | hasExport=${hasExport}`);
  }

  // 4. Check CSS files
  console.log('\n--- 4. CSS Files ---');
  const cssFiles = [
    'variables.css', 'reset.css', 'base.css', 'layout.css', 'animations.css',
    'hero.css', 'about.css', 'experience.css', 'projects.css', 'modal.css',
    'skills.css', 'contact.css', 'footer.css', 'chatbot.css'
  ];
  for (const f of cssFiles) {
    const r = await fetch(`http://localhost:3000/css/${f}`);
    console.log(`  ${f}: ${r.status} | ${r.headers.get('content-type')}`);
  }

  // 5. Check admin login
  console.log('\n--- 5. Admin Login ---');
  const loginRes = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'admin123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', JSON.stringify(loginData));
  console.log('Set-Cookie:', loginRes.headers.get('set-cookie'));

  // 6. API response timing (is it blocking the page?)
  console.log('\n--- 6. API Timing Test ---');
  const t1 = Date.now();
  await fetch('http://localhost:3000/api/content');
  console.log('2nd /api/content call:', Date.now() - t1, 'ms');

  console.log('\n=== DIAGNOSTIC COMPLETE ===');
}

diagnose().catch(e => console.error('Diagnostic failed:', e));
