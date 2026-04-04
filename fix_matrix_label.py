import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('I?/F?', 'Intensity \\\\ Freq')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
