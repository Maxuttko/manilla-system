const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\maxeu\\Documents\\manilla\\app';
const dirs = ['components', 'app'];

// Words that should NOT appear in user-facing texts in ASCII form
const badWords = [
  { rx: /\biesain/i, fix: 'iesaiņ...' },
  { rx: /\bpienem/i, fix: 'pieņem...' },
  { rx: /\bsanem/i, fix: 'saņem...' },
  { rx: /\bizsnieg/i, fix: 'izsnieg... (check izsniegts / izsniegšana)' },
  { rx: /\btermins\b/i, fix: 'termiņš' },
  { rx: /\btermina\b/i, fix: 'termiņa' },
  { rx: /\btermini\b/i, fix: 'termiņi' },
  { rx: /\btalrunis\b/i, fix: 'tālrunis' },
  { rx: /\btalruna\b/i, fix: 'tālruņa' },
  { rx: /\bsaskan/i, fix: 'saskaņ...' },
  { rx: /\bmateriali\b/i, fix: 'materiāli' },
  { rx: /\bmaterialu\b/i, fix: 'materiālu' },
  { rx: /\bmaterials\b/i, fix: 'materiāls' },
  { rx: /\bmaterialam\b/i, fix: 'materiālam' },
  { rx: /\bfiliale\b/i, fix: 'filiāle' },
  { rx: /\bfiliales\b/i, fix: 'filiāles' },
  { rx: /\bfiliali\b/i, fix: 'filiāli' },
  { rx: /\brekviziti\b/i, fix: 'rekvizīti' },
  { rx: /\bdavana\b/i, fix: 'dāvana' },
  { rx: /\bdavanas\b/i, fix: 'dāvanas' },
  { rx: /\bdavanu\b/i, fix: 'dāvanu' },
  { rx: /\blejupielad/i, fix: 'lejupielād...' },
  { rx: /\bdrukat\b/i, fix: 'drukāt' },
  { rx: /\bmeklet\b/i, fix: 'meklēt' },
  { rx: /\bfiltre/i, fix: 'filtrē...' },
  { rx: /\bapstiprinat\b/i, fix: 'apstiprināt' },
  { rx: /\bsaglabat\b/i, fix: 'saglabāt' },
  { rx: /\bludzu\b/i, fix: 'lūdzu' },
  { rx: /\bradit\b/i, fix: 'rādīt' },
  { rx: /\bpazinojums\b/i, fix: 'paziņojums' },
  { rx: /\bpazinojumi\b/i, fix: 'paziņojumi' },
  { rx: /\bpasutijums\b/i, fix: 'pasūtījums' },
  { rx: /\bpasutijumi\b/i, fix: 'pasūtījumi' },
  { rx: /\bpasutijuma\b/i, fix: 'pasūtījuma' },
  { rx: /\bpasutit\b/i, fix: 'pasūtīt' },
  { rx: /\bvertiba\b/i, fix: 'vērtība' },
  { rx: /\bnomainit\b/i, fix: 'nomainīt' },
  { rx: /\bmerijums\b/i, fix: 'mērījums' },
  { rx: /\bpaterins\b/i, fix: 'patēriņš' },
  { rx: /\bskatit\b/i, fix: 'skatīt' },
  { rx: /\batvert\b/i, fix: 'atvērt' },
  { rx: /\baizvert\b/i, fix: 'aizvērt' },
  { rx: /\bdzest\b/i, fix: 'dzēst' }
];

function checkString(str) {
  for (const b of badWords) {
    if (b.rx.test(str)) {
      return { match: b.rx.source, fix: b.fix };
    }
  }
  return null;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const hits = [];

  lines.forEach((line, idx) => {
    // skip imports, prisma fields, variable names like material.id
    if (/import |from ['"]|\.findMany|\.materials|const |let |interface |type |enum /.test(line)) {
      // but might still have JSX or string literals
    }
    // Find string literals or text between tags
    const stringMatches = line.match(/"([^"]+)"|'([^']+)'|`([^`]+)`|>([^<]+)</g);
    if (!stringMatches) return;

    for (const sm of stringMatches) {
      // clean sm
      const text = sm.replace(/^[>'"`]|['"`<]$/g, '').trim();
      if (!text || /^[a-zA-Z0-9_\-\.\/]+$/.test(text) && (text.includes('/') || text.includes('-') || text.includes('.'))) continue; // paths, css classes
      if (text.startsWith('bg-') || text.startsWith('text-') || text.startsWith('flex') || text.startsWith('border')) continue;
      
      const found = checkString(text);
      if (found) {
        // filter out code tokens
        if (text === 'materials' || text === 'pienemts' || text === 'iesainosana' || text === 'material' || text === 'orders' || text === 'orderId') continue;
        hits.push({ line: idx + 1, text, fix: found.fix, lineRaw: line.trim() });
      }
    }
  });
  return hits;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else if (ent.isFile() && (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts'))) {
      const hits = scanFile(full);
      if (hits.length > 0) {
        console.log(`\n[${path.relative(root, full)}]`);
        for (const h of hits) {
          console.log(`  L${h.line}: "${h.text}" -> FIX: ${h.fix}`);
          console.log(`     code: ${h.lineRaw}`);
        }
      }
    }
  }
}

dirs.forEach(d => walk(path.join(root, d)));
