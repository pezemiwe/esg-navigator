const fs = require('fs');
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(/\(acc\[\DQS \\\$\\{curr\.dqs\}\\\\]\)/g, "acc[\DQS \\]");
txt = txt.replace(/\(acc\[\DQS \\\$\\{curr\.dqs\}\\)/g, "acc[\DQS \\]");

fs.writeFileSync(file, txt);
console.log('fixed');
