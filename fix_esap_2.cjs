const fs = require('fs');
let f = fs.readFileSync('src/features/esrm/components/ESAPStep.tsx', 'utf8');

f = f.replace(
  'onSubmit={handleApproverSubmit}',
  'onSubmit={() => handleApproverSubmit(handleFinalSubmit)}'
);

fs.writeFileSync('src/features/esrm/components/ESAPStep.tsx', f);
