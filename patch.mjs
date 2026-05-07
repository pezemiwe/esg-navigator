import fs from 'fs';
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let txt = fs.readFileSync(file, 'utf8');

const sIdx = txt.indexOf('<div className=\"bg-white border border-[#e0e0e0] flex items-center justify-between px-6 py-6 mb-6\">');
const eIdx = txt.indexOf('Manual Insertion', sIdx) + 50;

if(sIdx !== -1) {
    const actEnd = txt.indexOf('</div>', eIdx) + 6;
    console.log('block found', sIdx, actEnd);
    
    // Check if grid follows
    const gridStart = txt.indexOf('<div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6\">', actEnd);
    let realEnd = actEnd;
    if (gridStart !== -1 && gridStart - actEnd < 50) {
        realEnd = txt.indexOf('{[', gridStart);
        // let's just replace the exact chunk
    }
}
