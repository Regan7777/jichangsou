import fs from 'fs';

const PRIMARY_KEY = '7ec54bed5e684bee9e50ea059b0e5538';
const ALT_KEY = '3ce47f206a70492fa2dacf38cf2396c2';
const HOST = 'jichangs.org';

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

  const keys = [PRIMARY_KEY, ALT_KEY];
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  for (const endpoint of endpoints) {
    console.log(`[IndexNow] Submitting to ${endpoint}...`);
    for (const key of keys) {
      const payload = {
        host: HOST,
        key: key,
        keyLocation: `https://${HOST}/${key}.txt`,
        urlList: urlList
      };
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(payload)
        });

        if (response.status === 200 || response.status === 202) {
          console.log(`[IndexNow] ${endpoint} -> Key ${key.slice(0, 8)}... Success! (${response.status} ${response.statusText})`);
          break;
        } else {
          const text = await response.text();
          console.log(`[IndexNow] Key ${key.slice(0, 8)}... failed (${response.status}): ${text}`);
        }
      } catch (err) {
        console.error(`[IndexNow] Error submitting with key ${key}:`, err.message);
      }
    }
  }
}

submitIndexNow();
