async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/content');
    console.log('Status Code:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const data = await res.json();
    console.log('Keys of returned data:', Object.keys(data));
    if (data.error) {
      console.log('Error returned:', data.error);
    } else {
      console.log('Profile name:', data.profile ? data.profile.name : 'null');
      console.log('Experience count:', data.experience ? data.experience.length : 'null');
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}
run();
