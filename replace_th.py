import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'\{uniqueRisks\.map\(\(risk\) => \([\s\S]*?<th[\s\S]*?writingMode:\s*"vertical-rl"[\s\S]*?</span>\s*</div>'

replacement = r'''{uniqueRisks.map((risk) => (
                        <th
                          key={risk}
                          title={risk}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 px-4 py-3 whitespace-nowrap min-w-[120px] text-center"
                        >
                          <span className="text-[12px] font-bold text-[#111] dark:text-[#F0F0F0]">
                            {risk}
                          </span>'''

text = re.sub(pattern, replacement, text)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
