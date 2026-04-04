import re

filename = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    text = f.read()

# Let's read the portfolio steps
match = re.search(r'const PORTFOLIO_STEPS = \[.*?\];', text, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("Not found")
