import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'\{uniqueRisks\.map\(\(risk\) => \([\s\S]*?<th>[\s\S]*?<th[\s\S]*?writingMode:\s*"vertical-rl"[\s\S]*?</span>\s*</div>',
    '',
    text
)
# wait, mapping to regex directly is tricky.
