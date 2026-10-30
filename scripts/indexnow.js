import fs from 'fs';

const API_KEY = '3ce47f206a70492fa2dacf38cf2396c2';
const HOST = 'jichangs.org';
const KEY_LOCATION = `https://${HOST}/${API_KEY}.txt`;

// Parse sitemap-0.xml or sitemap.xml to extract all URLs
function getUrls() {
  const candidates = ['dist/sitemap-0.xml', 'dist/sitemap.xml'];
  const sitemapPath = candidates.find(p => fs.existsSync(p));
  if (!sitemapPath) {
    throw new Error('Sitemap not found in dist/. Please run `npm run build` first.');
  }
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = [...content.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)];
  return matches.map(m => m[1]);
}

async function submitIndexNow() {
  const urlList = getUrls();
  console.log(`[IndexNow] Found ${urlList.length} URLs to submit from sitemap.`);

  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    console.log(`[IndexNow] Submitting to ${endpoint}...`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log(`[IndexNow] ${endpoint} -> Response Status: ${response.status} ${response.statusText}`);
      if (response.status === 200 || response.status === 202) {
        console.log(`[IndexNow] Success! (${response.status === 200 ? 'OK - Validated' : 'Accepted - Processing'})`);
      } else {
        const text = await response.text();
        console.log(`[IndexNow] Details: ${text}`);
      }
    } catch (err) {
      console.error(`[IndexNow] Error submitting to ${endpoint}:`, err.message);
    }
  }
}

submitIndexNow();
