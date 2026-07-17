async function check() {
  console.log('--- AUDITING LOCAL PORT 3000 SERVED FILES ---');
  
  try {
    const mainHtmlRes = await fetch('http://localhost:3000/');
    console.log('Landing page HTML response status:', mainHtmlRes.status);
    const htmlText = await mainHtmlRes.text();
    console.log('Has main.js script tag:', htmlText.includes('/js/main.js'));
    console.log('Has chatbot-widget div:', htmlText.includes('id="chatbot-widget"'));

    const mainJsRes = await fetch('http://localhost:3000/js/main.js');
    console.log('main.js response status:', mainJsRes.status);
    console.log('main.js Content-Type header:', mainJsRes.headers.get('content-type'));

    const apiJsRes = await fetch('http://localhost:3000/js/api.js');
    console.log('api.js response status:', apiJsRes.status);
    console.log('api.js Content-Type header:', apiJsRes.headers.get('content-type'));

    const contentRes = await fetch('http://localhost:3000/api/content');
    console.log('api/content response status:', contentRes.status);
    console.log('api/content Content-Type header:', contentRes.headers.get('content-type'));
    const contentData = await contentRes.json();
    console.log('api/content returns profile keys:', contentData.profile ? Object.keys(contentData.profile) : 'null');
    
  } catch (e) {
    console.error('Local server fetch audit failed:', e);
  }
}

check();
