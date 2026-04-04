import re
file_path = 'src/features/cra/pages/PhysicalRiskAssessment.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Add ScreenReportExport to imports
text = text.replace('import ScreenResponseExport from "../steps/physical/ScreenResponseExport";',
'''import ScreenResponseExport from "../steps/physical/ScreenResponseExport";
import ScreenReportExport from "../steps/physical/ScreenReportExport";''')

# Update PORTFOLIO_STEPS
old_steps = '''const PORTFOLIO_STEPS: StepDef[] = [
    { label: "Asset Register", icon: Upload },
    { label: "Hazard Screening", icon: Grid3x3 },
    { label: "Resilience", icon: Shield },
    { label: "Run", icon: Play },
    { label: "Results", icon: BarChart3 },
    { label: "Export", icon: Download },
  ];'''
new_steps = '''const PORTFOLIO_STEPS: StepDef[] = [
    { label: "Asset Register", icon: Upload },
    { label: "Hazard Screening", icon: Grid3x3 },
    { label: "Resilience", icon: Shield },
    { label: "Run", icon: Play },
    { label: "Results", icon: BarChart3 },
    { label: "Result & Response", icon: FileText },
    { label: "Export", icon: Download },
  ];'''
text = text.replace(old_steps, new_steps)

# Update PORTFOLIO_COMPONENTS
old_comps = '''const PORTFOLIO_COMPONENTS: ComponentType[] = [
    ScreenAssetRegister,
    ScreenHazardScreening,
    ScreenResilienceMeasures,
    ScreenRunAssessment,
    ScreenResultsDashboard,
    ScreenResponseExport,
  ];'''
new_comps = '''const PORTFOLIO_COMPONENTS: ComponentType[] = [
    ScreenAssetRegister,
    ScreenHazardScreening,
    ScreenResilienceMeasures,
    ScreenRunAssessment,
    ScreenResultsDashboard,
    ScreenResponseExport,
    ScreenReportExport,
  ];'''
text = text.replace(old_comps, new_comps)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)
