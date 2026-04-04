import re
file_path = 'src/features/cra/steps/physical/ScreenResponseExport.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Update Titles to Result and Response
text = re.sub(
    r'Step 06 of 06 &mdash; Response &amp; Export',
    r'Step 06 of 07 &mdash; Result &amp; Response',
    text
)
text = re.sub(
    r'Response &amp; Export',
    r'Result &amp; Response',
    text
)
text = re.sub(
    r'Step 06 / 06',
    r'Step 06 / 07',
    text
)
text = re.sub(
    r'Step 06 of 06 — Response & Export',
    r'Step 06 of 07 — Result & Response',
    text
)
text = re.sub(
    r'Response & Export',
    r'Result & Response',
    text
)
text = re.sub(
    r'export default function ScreenResponseExport',
    r'export default function ScreenResponseExport',
    text
)

# Remove the specific Export All Section
text = re.sub(
    r'<div className="bg-white dark:bg-\[#111\] border border-\[#D8D8D8\] dark:border-white/7">\s*<div className="px-5 py-4 border-b border-\[#E5E5E5\] dark:border-white/6">\s*<h2 className="text-\[14px\] font-bold text-\[#111\] dark:text-\[#F0F0F0\]">\s*Export Data\s*</h2>\s*</div>(.*?)Download Excel\s*</button>\s*</div>\s*</div>\s*</div>\s*</div>',
    r'',
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
