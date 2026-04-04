import re, os
p1 = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
t1 = open(p1, encoding='utf8').read()
t1 = re.sub(r'<div className=\{\s*?ixed bottom-0 left-0 right-0[\s\S]*?lg:ml-64 .*?\}', r'<div className={ixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:ml-64 }', t1)
open(p1, 'w', encoding='utf8').write(t1)

p2 = 'src/features/cra/steps/physical/ScreenReportExport.tsx'
t2 = open(p2, encoding='utf8').read()
t2 = re.sub(r'className=\{\s*?lex-1 flex flex-col[\s\S]*?hover:shadow-lg\}', r'className={lex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 rounded-xl transition-all cursor-pointer hover:border-[#86BC25] hover:bg-[#86BC25]/5 dark:hover:bg-[#86BC25]/10 border-[#E2E2E0] dark:border-[#333] hover:shadow-lg}', t2)
t2 = re.sub(r'\$\{Intl\.NumberFormat\("en-US", \{ style: "currency", currency: config\.currency, maximumFractionDigits: 0 \}\)\.format\(a\.value\)\}', r'${Intl.NumberFormat("en-US", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(a.value)}', t2)
t2 = re.sub(r'\$\{Intl\.NumberFormat\("en-US", \{ style: "currency", currency: config\.currency, maximumFractionDigits: 0 \}\)\.format\(r\.ealLocal\)\}', r'${Intl.NumberFormat("en-US", { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(r.ealLocal)}', t2)

open(p2, 'w', encoding='utf8').write(t2)
