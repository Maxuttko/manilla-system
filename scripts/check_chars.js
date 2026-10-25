const fs = require('fs');

const files = [
  'C:\\Users\\maxeu\\Documents\\manilla\\app\\components\\NewOrderWizard.tsx',
  'C:\\Users\\maxeu\\Documents\\manilla\\app\\components\\UserProfileModal.tsx',
  'C:\\Users\\maxeu\\Documents\\manilla\\app\\components\\ContractModal.tsx'
];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('~')) {
      console.log(`[TILDE FOUND in ${file.split('\\').pop()}:${idx+1}]: ${l.trim()}`);
    }
    // Check if there are NBSP \u00a0 or \u202f
    if (/[\u00a0\u202f\u200b\ufffd]/.test(l)) {
      console.log(`[INVISIBLE / UNUSUAL CHAR in ${file.split('\\').pop()}:${idx+1}]: ${l.trim()}`);
    }
  });
}
