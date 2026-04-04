import re

filename = 'src/features/cra/steps/physical/ScreenHazardScreening.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = re.compile(
    r'<th[^>]*?className="[^"]*?min-w-\[44px\]"[^>]*?>\s*<div[^>]*?>\s*<span[^>]*style=\{\{[^}]*writingMode:\s*"vertical-rl"[^}]*\}\}[^>]*>\s*\{risk\.risk\}\s*</span>\s*</div>\s*</th>',
    re.DOTALL
)

replacement = '''<th
                          key={risk.id}
                          title={risk.definition}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 px-4 py-3 text-center min-w-[140px]"
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-[13px] font-bold text-[#333] dark:text-[#E0E0E0] whitespace-normal leading-tight">
                              {risk.risk}
                            </span>
                          </div>
                        </th>'''

new_text = pattern.sub(replacement, text)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(new_text)

print("Replaced:", new_text != text)
