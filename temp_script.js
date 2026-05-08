const fs = require('fs');

let ui = fs.readFileSync('src/features/sustainability/pages/AIReport_ui.tsx', 'utf8');

// Strip theme usage
ui = ui.replace(/const theme = useTheme\(\);\n/g, '');
ui = ui.replace(/const isDark = theme\.palette\.mode === "dark";\n/g, 'const isDark = false;\n');
ui = ui.replace(/alpha\([^,]+, *([^\)]+)\)/g, '""'); 

// This regex-based approach will break a lot of things. It's better to provide a clean rewrite.
