const fs = require('fs');
let txt = fs.readFileSync('src/features/sustainability/pages/EmissionsModule.backup.tsx', 'utf8');
const sIdx = txt.indexOf('STEP 3: SCOPE 3');
const eIdx = txt.indexOf('STEP 4: DASHBOARD / METRICS');
const block = txt.substring(sIdx, eIdx);
console.log(block);
