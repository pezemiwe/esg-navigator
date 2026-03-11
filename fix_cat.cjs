const fs = require('fs');
let f = fs.readFileSync('src/features/esrm/components/CategorizationStep.tsx', 'utf8');

f = f.replace(
  'import React, { useState } from "react";',
  'import React, { useState } from "react";\nimport { useNavigate, useLocation } from "react-router-dom";'
);

f = f.replace(
  'const CategorizationStep: React.FC = () => {',
  'const CategorizationStep: React.FC = () => {\n  const navigate = useNavigate();\n  const location = useLocation();\n  const draftData = location.state?.draftData || {};\n  \n  const handleFinalSubmit = () => {\n    const updatedData = { ...draftData, stepNumber: 3, currentStepPath: "esdd" };\n    navigate("../esdd", { state: { draftData: updatedData } });\n  };'
);

f = f.replace(
  'onSubmit={handleSubmit}',
  'onSubmit={() => handleSubmit(handleFinalSubmit)}'
);

fs.writeFileSync('src/features/esrm/components/CategorizationStep.tsx', f);
