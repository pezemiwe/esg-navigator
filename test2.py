import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make Hazard Heat Map bigger
text = text.replace('min-w-6.5', 'min-[40px]')
text = text.replace('w-6.5 h-6.5', 'w-10 h-10')

# Heat Map Colors
text = re.sub(
    r'const color =\s*HAZARD_RATING_COLORS\[r.hazardRating\] \?\? "#888";',
    r'''let color = HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";
                          if (r.hazardRating === "High" || r.hazardRating === "Very High" || r.hazardRating === "Extreme") {
                            color = "#FF0000";
                          }''',
    text
)

# Separate layouts
text = text.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">', '<div className="flex flex-col gap-6">')

# Make Risk Matrix bigger
text = text.replace('min-w-[36px] py-1', 'min-w-[60px] py-4 text-[14px]')
text = text.replace('className="border-collapse text-[10px]"', 'className="border-collapse text-[12px] w-full"')

# Change Risk Matrix color to Bright Red for High/Very High/Extreme
text = re.sub(
    r'const color = HAZARD_RATING_COLORS\[rating\] \|\| "#888";([\s\S]*?)backgroundColor:[^\}]+(fontWeight:[^\}]+)\}\}',
    r'''let color = HAZARD_RATING_COLORS[rating] || "#888";
                            if (rating === "High" || rating === "Very High" || rating === "Extreme") {
                              color = "#FF0000";
                            }\g<1>backgroundColor: ${color}, \g<2>}}''',
    text
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

