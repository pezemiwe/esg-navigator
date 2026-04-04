import re
file_path = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('ixed bottom-0')
if idx != -1:
    start_idx = text.rfind('<div className={', 0, idx)
    end_idx = text.find('}>', idx)
    if start_idx != -1 and end_idx != -1:
        text = text[:start_idx] + '<div className={ixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:ml-64 ' + text[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
