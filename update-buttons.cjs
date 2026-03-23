const fs = require("fs");
const path = require("path");

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");

      let newContent = content.replace(/<Button([\s\S]*?)>/g, (match, p1) => {
        // remove existing borderRadius from Button props
        // It could be in sx={{ borderRadius: "8px" }}
        let updatedProps = p1.replace(
          /borderRadius:\s*["']?\d+px["']?\s*,?/g,
          "",
        );
        updatedProps = updatedProps.replace(/borderRadius:\s*\d+\s*,?/g, "");

        // now add standard borderRadius: 1.5 if not present
        if (!updatedProps.includes("borderRadius: 1.5")) {
          if (updatedProps.includes("sx={{")) {
            updatedProps = updatedProps.replace(
              /sx=\{\{/,
              "sx={{ borderRadius: 1.5, ",
            );
          } else {
            if (updatedProps.endsWith("/")) {
              updatedProps =
                updatedProps.slice(0, -1) + " sx={{ borderRadius: 1.5 }} /";
            } else {
              updatedProps = updatedProps + " sx={{ borderRadius: 1.5 }}";
            }
          }
        }
        return `<Button${updatedProps}>`;
      });

      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
        console.log("Updated " + fullPath);
      }
    }
  }
}

processDir("src/features/materiality");
