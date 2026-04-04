import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

bad_str = '''                      {uniqueRisks.map((risk) => (
                        <th
                          key={risk}
                          title={risk}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 p-0 min-[40px]"
                        >
                          <div
                            className="flex items-end justify-center py-2 px-0.5"
                            style={{ height: 72 }}
                          >
                            <span
                              className="text-[9px] font-medium text-[#666] dark:text-[#999]"
                              style={{
                                writingMode: "vertical-rl",
                                transform: "rotate(180deg)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {risk}
                            </span>
                          </div>'''

good_str = '''                      {uniqueRisks.map((risk) => (
                        <th
                          key={risk}
                          title={risk}
                          className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 px-4 py-3 whitespace-nowrap min-w-[120px] text-center"
                        >
                          <span className="text-[12px] font-bold text-[#111] dark:text-[#F0F0F0]">
                            {risk}
                          </span>'''

text = text.replace(bad_str, good_str)
text = text.replace(bad_str.replace('\n', '\r\n'), good_str)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
