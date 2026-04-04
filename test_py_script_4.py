import re

filename = 'src/features/cra/steps/physical/ScreenRunAssessment.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(r'(<p className="text-\[11px\] font-semibold uppercase\n.*?Step 04 of 06.*?)(Run Physical Risk Assessment\n\s*</h1>\n\s*</div>)', re.DOTALL)

replacement = r'''\1\2
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-[#333] dark:text-[#CCC] mb-3">
                Selected Hazards for Assessment
              </h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(screening.flatMap(s => s.risks))).map(risk => (
                  <span key={risk} className="px-2.5 py-1 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/10 text-[11px] text-[#555] dark:text-[#999] rounded">
                    {risk}
                  </span>
                ))}
              </div>
            </div>'''
            
new_text = pattern.sub(replacement, text)

# also replace mobile version view if it's there. The above is Desktop version probably ? 
# Let's just do it directly around where Run Physical Risk Assessment is.

with open(filename, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Replaced:", text != new_text)
