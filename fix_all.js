const fs = require('fs');

const path1 = 'src/features/cra/pages/PhysicalRiskAssessment.tsx';
let t1 = fs.readFileSync(path1, "utf8");
t1 = t1.replace(/<div className=\{[\s\S]*?ixed bottom-0 left-0 right-0 z-50 transform[\s\S]*?lg:ml-64 \}>/, '<div className={`fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:ml-64 ${isLastStep && results.length > 0 ? "translate-y-0" : "translate-y-full"}`}>');
fs.writeFileSync(path1, t1);

const path2 = 'src/features/cra/steps/physical/ScreenReportExport.tsx';
let t2 = fs.readFileSync(path2, "utf8");
t2 = t2.replace(/className=\{[\s\S]*?lex-1 flex flex-col[\s\S]*?hover:shadow-lg\}/g, 'className={`flex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 rounded-xl transition-all cursor-pointer hover:border-[#86BC25] hover:bg-[#86BC25]/5 dark:hover:bg-[#86BC25]/10 border-[#E2E2E0] dark:border-[#333] hover:shadow-lg`}');

t2 = t2.replace(/\$\{Intl\.NumberFormat\("en-US", \{ style: "currency", currency: config\.currency, maximumFractionDigits: 0 \}\)\.format\(a\.value\)\}/g, '`${Intl.NumberFormat("en-US", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(a.value)}`');
t2 = t2.replace(/\$\{Intl\.NumberFormat\("en-US", \{ style: "currency", currency: config\.currency, maximumFractionDigits: 0 \}\)\.format\(r\.ealLocal\)\}/g, '`${Intl.NumberFormat("en-US", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(r.ealLocal)}`');

t2 = t2.replace(/className=\{"fixed bottom-0/g, 'className={`fixed bottom-0');

fs.writeFileSync(path2, t2);
