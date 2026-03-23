const fs = require('fs');
let f = fs.readFileSync('src/features/esrm/components/ESAPStep.tsx', 'utf8');

if (!f.includes('react-router-dom')) {
  f = "import { useNavigate, useLocation } from 'react-router-dom';\n" + f;
}

f = f.replace(
  'function ESAPStep() {',
  'function ESAPStep() {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const draftData = location.state?.draftData || {};\n  \n  const handleFinalSubmit = () => {\n    const updatedData = { ...draftData, stepNumber: 5, currentStepPath: "appraisal" };\n    navigate("../appraisal", { state: { draftData: updatedData } });\n  };'
);

f = f.replace(
  'onSubmit={handleSubmit}',
  'onSubmit={() => handleSubmit(handleFinalSubmit)}'
);

fs.writeFileSync('src/features/esrm/components/ESAPStep.tsx', f);
