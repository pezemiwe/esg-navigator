# -*- coding: utf-8 -*-
import re
file_path = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'\{/\* Transition Risk CTA \*/\}.*?\{/\* Footer nav \*/\}',
    r'{/* Footer nav */}',
    text,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
