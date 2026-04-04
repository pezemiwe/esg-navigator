import re
file_path = 'src/features/cra/steps/physical/ScreenResultsDashboard.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Make Hazard Heat Map bigger
text = text.replace('min-w-6.5', 'min-w-[40px]')
text = text.replace('w-6.5 h-6.5', 'w-10 h-10')

# Make Heat Map colors for High / Very High / Extreme bright red
# Instead of color = HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";
new_color_code = '''                          let color = HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";
                          if (r.hazardRating === "High" || r.hazardRating === "Very High" || r.hazardRating === "Extreme") {
                            color = "#FF0000";
                          }'''
text = text.replace('const color =\n                          HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";', new_color_code)

# Separate Risk Matrix from Rating Distribution
text = text.replace('<div className="grid grid-cols-1 md:grid-cols-2 gap-4">', '<div className="flex flex-col gap-6">')

# Make Risk Matrix bigger
text = text.replace('min-w-[36px] py-1', 'min-w-[60px] py-3 text-[14px]')
text = text.replace('className="border-collapse text-[10px]"', 'className="border-collapse text-[12px] w-full"')

# Change Risk Matrix color to Bright Red for High/Very High/Extreme
old_risk_color = '''const color = HAZARD_RATING_COLORS[rating] || "#888";
                            return (
                              <td
                                key={freq}
                                title={count ? ${count} risk(s) : rating}
                                className="border border-[#D8D8D8] dark:border-white/7 text-center min-w-[36px] py-1"
                                style={{
                                  backgroundColor: ${color},
                                  fontWeight: count > 0 ? 700 : 400,
                                }}'''

# Since we already ran min-w-[] replacements above, we need to match the original text but using regular expressions for robustness.
