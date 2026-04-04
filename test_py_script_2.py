import re

filename = 'src/features/cra/steps/physical/ScreenHazardScreening.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

# Change risk headers
old_th = '''                        <th
                          key={risk.id}
                          title={risk.definition}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 p-0 text-center min-w-[44px]"
                        >
                          <div
                            className="flex items-end justify-center py-2 px-1"
                            style={{ height: 80 }}
                          >
                            <span
                              className="text-[9px] font-medium text-[#666] dark:text-[#999] leading-none"
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {risk.risk}
                            </span>
                          </div>
                        </th>'''

new_th = '''                        <th
                          key={risk.id}
                          title={risk.definition}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 p-2 text-center min-w-[140px]"
                        >
                          <div className="flex items-center justify-center">
                            <span className="text-[12px] font-bold text-[#333] dark:text-[#E0E0E0] whitespace-normal leading-tight">
                              {risk.risk}
                            </span>
                          </div>
                        </th>'''

# Replace literal block 
# We'll use a direct string replace if possible, but python re is fine.
text = text.replace(old_th, new_th)

with open(filename, 'w', encoding='utf-8') as f:
    f.write(text)
