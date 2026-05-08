const fs = require('fs');
let code = fs.readFileSync('src/features/materiality/MaterialityDashboard.tsx', 'utf-8');

code = code.replace('bulkAssignTopics(selectedIds, bulkAssignee);', 'bulkAssignTopics(selectedIds, bulkAssignee, user?.name || \"System\", \"\");');
code = code.replace(/u\.id/g, 'u.name');
code = code.replace(/u\.department/g, 'u.role');
code = code.replace('<MaterialityTemplateList />', '<MaterialityTemplateList topics={topics} />');
code = code.replace('ArrowLeft,', '');
code = code.replace('UserX,', '');
code = code.replace('AlertTriangle,', '');
code = code.replace('import type { MaterialTopic } from \"./types\";\r\n', '');
code = code.replace('import type { MaterialTopic } from \"./types\";\n', '');
code = code.replace('const BRAND = DELOITTE_COLORS.green.DEFAULT;', '');
code = code.replace('approveTopic, rejectTopic, ', '');

fs.writeFileSync('src/features/materiality/MaterialityDashboard.tsx', code);
