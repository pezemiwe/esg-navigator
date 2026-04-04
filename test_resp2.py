# -*- coding: utf-8 -*-
import re
file_path = 'src/features/cra/steps/physical/ScreenResponseExport.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('Step 06 of 06', 'Step 06 of 07')
text = text.replace('Response &amp; Export', 'Result and Response')
text = text.replace('Response & Export', 'Result and Response')
text = text.replace('Step 06 / 06', 'Step 06 / 07')
text = text.replace('Response &amp; Export', 'Result and Response')
text = text.replace('Response strategy implementation.', 'Result and Response details.')
text = text.replace('Prioritised action plan, monitoring schedule, and full XLSX export.', 'Prioritised action plan and monitoring schedule.')

import re
text = re.sub(r'<div className="bg-white dark:bg-\[#111\] border border-\[#D8D8D8\] dark:border-white/7">\s*<div className="px-5 py-4 border-b border-\[#E5E5E5\] dark:border-white/6">\s*<h2 className="text-\[14px\] font-bold text-\[#111\] dark:text-\[#F0F0F0\]">\s*Export Data\s*</h2>\s*</div>.*?Download Excel\s*</button>\s*</div>\s*</div>\s*</div>\s*</div>', '', text, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
