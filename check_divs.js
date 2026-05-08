const fs = require("fs");
const t = fs.readFileSync("src/features/sustainability/pages/EmissionsModule.tsx", "utf8");

// let's grab step 3 block
const match = t.match(/\{step === 3 && \(([\s\S]*?)\)\}/);
if (match) {
    const block = match[1];
    const openCount = (block.match(/<div/g) || []).length;
    const closeCount = (block.match(/<\/div>/g) || []).length;
    console.log("step 3 divs:", openCount, "closes:", closeCount);
}
