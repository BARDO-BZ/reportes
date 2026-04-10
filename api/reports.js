import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function extractTitle(html) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return match ? match[1].trim() : null;
}

function formatName(filename) {
  return filename
    .replace(/\.html?$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const reportsDir = join(process.cwd(), 'reports');

  try {
    const files = readdirSync(reportsDir)
      .filter(f => f.match(/\.html?$/i))
      .map(filename => {
        const filepath = join(reportsDir, filename);
        const stat = statSync(filepath);
        let title = null;

        try {
          const content = readFileSync(filepath, 'utf-8');
          title = extractTitle(content);
        } catch {}

        return {
          filename,
          title: title || formatName(filename),
          path: `/reports/${filename}`,
          date: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(files);
  } catch {
    res.status(200).json([]);
  }
}
