import re

file1 = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
file2 = 'src/features/cra/steps/physical/ScreenReportExport.tsx'

with open(file1, 'r', encoding='utf-8') as f:
    text1 = f.read()

text1 = re.sub(r'<div className=\{\s*?[a-z0-9A-Z\s_-]*?ixed bottom-0.*?\}>', r'<div className={ixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:ml-64 }>', text1, flags=re.DOTALL)

with open(file1, 'w', encoding='utf-8') as f:
    f.write(text1)

with open(file2, 'r', encoding='utf-8') as f:
    text2 = f.read()

text2 = re.sub(r'className=\{\s*[a-z0-9A-Z\s_-]*?lex-1 flex flex-col.*?\s*\}', r'className={lex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 rounded-xl transition-all cursor-pointer hover:border-[#86BC25] hover:bg-[#86BC25]/5 dark:hover:bg-[#86BC25]/10 border-[#E2E2E0] dark:border-[#333] hover:shadow-lg}', text2, flags=re.DOTALL)

text2 = re.sub(r'(\$\{Intl\.NumberFormat[^}]+\}\)\.format\([^\)]+\)\})', lambda m: '' + m.group(1) + '', text2)
text2 = re.sub(r'`\$', '$', text2)

text2 = text2.replace('className={"fixed bottom-0', 'className={ixed bottom-0')

with open(file2, 'w', encoding='utf-8') as f:
    f.write(text2)
