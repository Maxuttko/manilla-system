const fs = require('fs');

const content = fs.readFileSync('C:\\Users\\maxeu\\Documents\\manilla\\app\\components\\NewOrderWizard.tsx', 'utf8');
const lines = content.split('\n');

const wordsToCheck = [
  'iesainot', 'iesainosana', 'pienemsana', 'sanemsana', 'talrunis', 'filiale', 'davana', 'davanas', 'materials', 'materiali', 'rekviziti', 'parakstits', 'ligums', 'apstiprinat', 'saglabat', 'termina'
];

lines.forEach((l, i) => {
  // skip code lines
  if (/const |import |interface |type |db\./.test(l)) return;
  const lower = l.toLowerCase();
  for (const w of wordsToCheck) {
    if (lower.includes(w)) {
      console.log(`L${i+1}: [${w}] -> ${l.trim()}`);
    }
  }
});
