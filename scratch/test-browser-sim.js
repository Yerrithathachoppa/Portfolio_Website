/**
 * Test: Simulate what the browser does - fetch content and check if 
 * the rendering functions would produce HTML.
 * Also test IntersectionObserver behavior.
 */
async function test() {
  console.log('=== BROWSER SIMULATION TEST ===\n');

  // Test 1: Fetch /api/content and time it
  console.log('--- Test 1: Fetch /api/content timing ---');
  const t0 = Date.now();
  const res = await fetch('http://localhost:3000/api/content');
  const data = await res.json();
  console.log(`Response in ${Date.now() - t0}ms`);
  console.log('Profile:', data.profile?.name);
  console.log('Status:', res.status);

  // Test 2: Check if the landing page HTML has been served WITH the hash in URL
  console.log('\n--- Test 2: Fetch landing page with hash ---');
  const htmlRes = await fetch('http://localhost:3000/');
  const html = await htmlRes.text();
  
  // Check if the script tag has type="module"
  const scriptMatch = html.match(/<script[^>]*src="\/js\/main\.js"[^>]*>/);
  console.log('Script tag match:', scriptMatch ? scriptMatch[0] : 'NOT FOUND');
  
  // Test 3: Check experience.js for the rendering function export  
  console.log('\n--- Test 3: Check experience.js code ---');
  const expRes = await fetch('http://localhost:3000/js/experience.js');
  const expCode = await expRes.text();
  console.log('Has renderExperience export:', expCode.includes('export function renderExperience'));
  
  // Test 4: Check chatbot.js duplicate export
  console.log('\n--- Test 4: Check chatbot.js for duplicate exports ---');
  const chatRes = await fetch('http://localhost:3000/js/chatbot.js');
  const chatCode = await chatRes.text();
  const exportMatches = chatCode.match(/export/g);
  console.log('Number of "export" in chatbot.js:', exportMatches?.length);
  // Check for duplicate export of initChatbot
  const initChatbotExports = chatCode.match(/export.*initChatbot/g);
  console.log('initChatbot export occurrences:', initChatbotExports);
  
  // Test 5: Check if chatbot.js has syntax issues
  console.log('\n--- Test 5: chatbot.js export pattern ---');
  const lines = chatCode.split('\n');
  const exportLines = lines.filter(l => l.includes('export'));
  exportLines.forEach(l => console.log('  EXPORT LINE:', l.trim()));

  console.log('\n=== TEST COMPLETE ===');
}

test().catch(e => console.error('Test failed:', e));
