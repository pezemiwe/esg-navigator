import re

filename = 'src/features/cra/steps/physical/ScreenRunAssessment.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

old_str = '''              <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                Run Physical Risk Assessment
              </h1>
            </div>

            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-6">'''

new_str = '''              <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                Run Physical Risk Assessment
              </h1>
            </div>

            <div className="mb-6 border border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
              <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6">
                <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                  Selected Hazards for Assessment
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-2">
                {Array.from(new Set(screening.flatMap(s => s.risks))).map((risk) => (
                  <span key={risk} className="px-3 py-1.5 bg-[#F9F9F8] dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/10 text-[12px] font-medium text-[#444] dark:text-[#CCC] whitespace-nowrap">
                    {risk}
                  </span>
                ))}
                {Array.from(new Set(screening.flatMap(s => s.risks))).length === 0 && (
                  <span className="text-[13px] text-[#888]">No hazards selected</span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-6">'''

text = text.replace(old_str, new_str)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(text)

print("Replaced:", old_str in new_str)
