const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\maxeu\\Documents\\manilla\\app';
const dirs = ['components', 'app'];

const suspiciousPatterns = [
  { regex: /\biesainot\b/i, correct: 'iesaiņot' },
  { regex: /\biesainosana\b/i, correct: 'iesaiņošana' },
  { regex: /\biesainosana\b/i, correct: 'iesaiņošanā' },
  { regex: /\biesainotajs\b/i, correct: 'iesaiņotājs' },
  { regex: /\biesainots\b/i, correct: 'iesaiņots' },
  { regex: /\bpienemts\b/i, correct: 'pieņemts' },
  { regex: /\bpienemsana\b/i, correct: 'pieņemšana' },
  { regex: /\bpienemts\b/i, correct: 'pieņemts' },
  { regex: /\bgatavs sanemsanai\b/i, correct: 'gatavs saņemšanai' },
  { regex: /\bsanemsana\b/i, correct: 'saņemšana' },
  { regex: /\bsanemts\b/i, correct: 'saņemts' },
  { regex: /\bizsniegsana\b/i, correct: 'izsniegšana' },
  { regex: /\btermins\b/i, correct: 'termiņš' },
  { regex: /\btermina\b/i, correct: 'termiņa' },
  { regex: /\btalrunis\b/i, correct: 'tālrunis' },
  { regex: /\btalruna\b/i, correct: 'tālruņa' },
  { regex: /\bvards\b/i, correct: 'vārds' },
  { regex: /\bklienta vards\b/i, correct: 'klienta vārds' },
  { regex: /\bparaksts\b/i, correct: 'paraksts (ok)' },
  { regex: /\bsaskanots\b/i, correct: 'saskaņots' },
  { regex: /\bsaskanot\b/i, correct: 'saskaņot' },
  { regex: /\bsaskana\b/i, correct: 'saskaņā' },
  { regex: /\bmateriali\b/i, correct: 'materiāli' },
  { regex: /\bmaterialu\b/i, correct: 'materiālu' },
  { regex: /\bmaterials\b/i, correct: 'materiāls' },
  { regex: /\bfiliale\b/i, correct: 'filiāle' },
  { regex: /\bfiliales\b/i, correct: 'filiāles' },
  { regex: /\bfiliali\b/i, correct: 'filiāli' },
  { regex: /\brekviziti\b/i, correct: 'rekvizīti' },
  { regex: /\bdavana\b/i, correct: 'dāvana' },
  { regex: /\bdavanas\b/i, correct: 'dāvanas' },
  { regex: /\bdavanu\b/i, correct: 'dāvanu' },
  { regex: /\bdavanai\b/i, correct: 'dāvanai' },
  { regex: /\blejupieladet\b/i, correct: 'lejupielādēt' },
  { regex: /\bdrukat\b/i, correct: 'drukāt' },
  { regex: /\bmeklet\b/i, correct: 'meklēt' },
  { regex: /\bfiltre\b/i, correct: 'filtrē' },
  { regex: /\bapstiprinat\b/i, correct: 'apstiprināt' },
  { regex: /\bsaglabat\b/i, correct: 'saglabāt' },
  { regex: /\bklud\b/i, correct: 'kļūd...' },
  { regex: /\bludzu\b/i, correct: 'lūdzu' },
  { regex: /\bradit\b/i, correct: 'rādīt' },
  { regex: /\bpazinojums\b/i, correct: 'paziņojums' },
  { regex: /\bpazinojumi\b/i, correct: 'paziņojumi' },
  { regex: /\bpasutijums\b/i, correct: 'pasūtījums' },
  { regex: /\bpasutijumi\b/i, correct: 'pasūtījumi' },
  { regex: /\bpasutijuma\b/i, correct: 'pasūtījuma' },
  { regex: /\bpasutit\b/i, correct: 'pasūtīt' },
  { regex: /\bvertiba\b/i, correct: 'vērtība' },
  { regex: /\bkopsumma\b/i, correct: 'kopsumma' },
  { regex: /\bdati\b/i, correct: 'dati' },
  { regex: /\bnumurs\b/i, correct: 'numurs' },
  { regex: /\blaiks\b/i, correct: 'laiks' },
  { regex: /\bparole\b/i, correct: 'parole' },
  { regex: /\bnomainit\b/i, correct: 'nomainīt' },
  { regex: /\bielogoties\b/i, correct: 'ielogoties' },
  { regex: /\biziet\b/i, correct: 'iziet' },
  { regex: /\bkasieris\b/i, correct: 'kasieris' },
  { regex: /\bmeistars\b/i, correct: 'meistars' },
  { regex: /\bvaditajs\b/i, correct: 'vadītājs' },
  { regex: /\bmerijums\b/i, correct: 'mērījums' },
  { regex: /\bpatere\b/i, correct: 'patēriņš / patērēts' },
  { regex: /\bpaterins\b/i, correct: 'patēriņš' },
  { regex: /\bskatit\b/i, correct: 'skatīt' },
  { regex: /\batvert\b/i, correct: 'atvērt' },
  { regex: /\baizvert\b/i, correct: 'aizvērt' },
  { regex: /\bdzest\b/i, correct: 'dzēst' },
  { regex: /\blabot\b/i, correct: 'labot' },
  { regex: /\bpievienot\b/i, correct: 'pievienot' }
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];

  lines.forEach((line, idx) => {
    // skip imports, schema keys, svg paths, classNames, url paths
    if (line.includes('import ') || line.includes('from \'') || line.includes('from "')) return;
    if (line.includes('className="') && !line.includes('>') && !line.includes('placeholder=')) return;
    if (line.includes('http://') || line.includes('https://')) return;
    if (/status === ["']|status: ["']|viewMode ===/.test(line)) return;

    for (const pat of suspiciousPatterns) {
      if (pat.regex.test(line)) {
        // Exclude enum keys or variable declarations like const IESAINOSANA or status: 'PIENEMTS'
        if (/[A-Z_]{3,}/.test(line) && line.includes(pat.regex.source.replace(/\\b/g, '').toUpperCase())) continue;
        findings.push({
          lineNum: idx + 1,
          line: line.trim(),
          matched: pat.regex.source,
          suggest: pat.correct
        });
      }
    }
  });

  return findings;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(full);
    } else if (ent.isFile() && (ent.name.endsWith('.tsx') || ent.name.endsWith('.ts'))) {
      const issues = scanFile(full);
      if (issues.length > 0) {
        console.log(`\n=== FILE: ${path.relative(root, full)} ===`);
        for (const iss of issues) {
          console.log(`  L${iss.lineNum}: [${iss.suggest}] -> ${iss.line}`);
        }
      }
    }
  }
}

for (const d of dirs) {
  walk(path.join(root, d));
}
