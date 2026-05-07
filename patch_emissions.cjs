const fs = require('fs');
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let text = fs.readFileSync(file, 'utf8');

if (!text.includes('import * as XLSX')) {
    text = text.replace('import { useState, useMemo, useRef } from \"react\";', 'import { useState, useMemo, useRef } from \"react\";\nimport * as XLSX from \"xlsx\";');
}

// Just match between step === 2 and step === 3
const regex = /\{step === 2 && \([\s\S]*?(?=\{step === 3 && \()/;
if (regex.test(text)) {
    const componentStr = fs.readFileSync('components.txt', 'utf8');
    text = text.replace(regex, componentStr);
    fs.writeFileSync(file, text);
    console.log('Patched');
} else {
    console.log('Regex fail');
}
