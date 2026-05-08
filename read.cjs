const fs = require('fs');
let txt = fs.readFileSync('src/features/sustainability/pages/EmissionsModule.tsx', 'utf8');
const sIdx = txt.indexOf('<input');
console.log(txt.substring(sIdx, sIdx + 1000));

