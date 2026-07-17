let cachedContent = null;
let fetchPromise = null;

/**
 * Fetches public content from content API.
 * Caches the response in-memory.
 */
export async function getContent() {
  if (cachedContent) {
    return cachedContent;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = fetch('/api/content')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch site content');
      }
      return response.json();
    })
    .then(data => {
      cachedContent = data;
      return cachedContent;
    })
    .catch(err => {
      fetchPromise = null; // Clear promise on failure to allow retry
      console.error('API Fetch Error:', err);
      throw err;
    });

  return fetchPromise;
}
