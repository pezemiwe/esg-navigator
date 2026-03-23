const fs = require('fs');
const file = "C:/Users/pezemiwe/Documents/gcb-esg-navigator/src/config/sasb.config.ts";
let content = fs.readFileSync(file, "utf8");

// Extract the SASB_TAXONOMY array string
const taxonomyMatch = content.match(/export const SASB_TAXONOMY: SasbSector\[\] = (\[(.*?)\]);/s);
if (!taxonomyMatch) {
  console.log("No taxonomy found");
  process.exit(1);
}

// Very hacky eval to get the object
const taxonomyStr = taxonomyMatch[1].replace(/â€“/g, "-");
let SASB_TAXONOMY;
eval("SASB_TAXONOMY = " + taxonomyStr);

// Get the existing metrics string
const metricsMatch = content.match(/export const SASB_INDUSTRY_METRICS: Record<string, SasbMetric\[\]> = \{(\{.*?\})\s*};/s);
let existingMetricsStr = metricsMatch ? metricsMatch[1] : "";

let allIndustries = [];
SASB_TAXONOMY.forEach(sector => {
  sector.industries.forEach(ind => {
    allIndustries.push(ind);
  });
});

let appended = false;
let insertionStr = "";

allIndustries.forEach(industry => {
  if (!content.includes(`"${industry}": [`)) {
    console.log(`Adding placeholders for ${industry}`);
    insertionStr += `  "${industry}": [
    {
      topic: "Energy Management",
      metric: "Total energy consumed",
      category: "Quantitative",
      unit: "Gigajoules (GJ), Percentage (%)",
      code: "GEN-001"
    },
    {
      topic: "Workforce Health & Safety",
      metric: "Total recordable incident rate (TRIR)",
      category: "Quantitative",
      unit: "Rate",
      code: "GEN-002"
    },
    {
      topic: "Business Ethics",
      metric: "Description of policies and practices for prevention of corruption and bribery",
      category: "Discussion and Analysis",
      unit: "n/a",
      code: "GEN-003"
    }
  ],\n`;
    appended = true;
  }
});

if (appended) {
  content = content.replace(/(export const SASB_INDUSTRY_METRICS: Record<string, SasbMetric\[\]> = \{[\s\S]*?)};\s*$/s, `$1${insertionStr}};\n`);
  fs.writeFileSync(file, content, "utf8");
  console.log("Added to sasb.config.ts");
} else {
  console.log("All industries already present or failed to parse");
}
