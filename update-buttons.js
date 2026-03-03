const fs = require("fs");
const path = require("path");

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");

      // Match all Button components (self-closing or with children)
      let newContent = content.replace(
        /<Button[\s\S]*?(?:<\/Button>|\/>)/g,
        (match) => {
          // Replace existing borderRadius inside the matched Button
          let updatedMatch = match.replace(
            /borderRadius:\s*['"0-9a-zA-Z\.]+(px)?['"]?,?\s*/g,
            "",
          );

          // If it doesn't have sx prop but we want to add one, we could, but let's just
          // add borderRadius: 1.5 to existing sx props. Wait, the user wants it specifically setup?
          // Let's just remove the explicit borderRadius first, and add borderRadius: 1.5 inside sx={...}
          // Actually, if we just set sx={{ ..., borderRadius: 1.5 }}

          // Let's first remove existing borderRadius
          return updatedMatch;
        },
      );

      // We also need to add borderRadius: 1.5 to sx.
      // Easiest is to just regex match sx={{...}} inside Button
      newContent = newContent.replace(
        /<Button([\s\S]*?)sx={{([\s\S]*?)}}/g,
        (match, p1, p2) => {
          // Don't add if it already has it (we just removed hardcoded ones, but let's be safe)
          if (!p2.includes("borderRadius")) {
            return `<Button${p1}sx={{ borderRadius: 1.5, ${p2.trim()} }}`;
          }
          return match;
        },
      );

      // What if Button doesn't have sx prop?
      // In Materiality, most buttons have sx prop. But we can catch those without sx too.
      newContent = newContent.replace(
        /<Button((?:(?!\bsx=)[^>])+?)>/g,
        (match, p1) => {
          // If it's a self-closing button, it ends with />
          if (p1.endsWith("/")) {
            const inner = p1.slice(0, -1);
            return `<Button${inner} sx={{ borderRadius: 1.5 }} />`;
          }
          return `<Button${p1} sx={{ borderRadius: 1.5 }}>`;
        },
      );

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log("Updated " + fullPath);
      }
    }
  });
}

processDir("src/features/materiality");
