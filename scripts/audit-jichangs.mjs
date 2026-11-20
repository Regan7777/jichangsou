import fs from 'node:fs';
import path from 'node:path';

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const distDir = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.log('No dist folder');
  process.exit(0);
}
const files = getHtmlFiles(distDir);
console.log('Total HTML pages in dist:', files.length);

const issuesSummary = [];

for (const file of files) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  if (rel.startsWith('go/')) continue; // skip redirects

  const html = fs.readFileSync(file, 'utf-8');
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '(NO TITLE)';
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  const desc = descMatch ? descMatch[1] : '';

  const issues = [];
  if (h1Matches.length === 0) issues.push('NO H1');
  if (h1Matches.length > 1) issues.push(`DUPLICATE H1 (${h1Matches.length})`);
  if (!desc) issues.push('NO DESC');
  else if (desc.length < 50) issues.push(`DESC SHORT (${desc.length})`);

  if (issues.length > 0) {
    issuesSummary.push({ url: rel, issues: issues.join(', '), h1s: h1Matches.length, descLen: desc.length, title: title.slice(0, 30) });
  }
}

console.log('Pages with issues:', issuesSummary.length);
if (issuesSummary.length > 0) {
  console.log(JSON.stringify(issuesSummary, null, 2));
} else {
  console.log('✅ All non-redirect pages passed H1 and Meta checks!');
}
