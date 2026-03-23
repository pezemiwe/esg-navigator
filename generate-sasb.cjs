const fs = require("fs");
const path = require("path");

const csvPath =
  "c:\\Users\\pezemiwe\\Downloads\\sasb_all_remaining_industries.csv";
const outPath = path.join(__dirname, "src", "config", "sasb.config.ts");

function parseCSV(str) {
  const arr = [];
  let quote = false;
  let row = 0,
    col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c],
      nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || "";
    if (cc === '"' && quote && nc === '"') {
      arr[row][col] += cc;
      ++c;
      continue;
    }
    if (cc === '"') {
      quote = !quote;
      continue;
    }
    if (cc === "," && !quote) {
      ++col;
      continue;
    }
    if (cc === "\r" && nc === "\n" && !quote) {
      ++row;
      col = 0;
      ++c;
      continue;
    }
    if (cc === "\n" && !quote) {
      ++row;
      col = 0;
      continue;
    }
    if (cc === "\r" && !quote) {
      ++row;
      col = 0;
      continue;
    }
    arr[row][col] += cc;
  }
  return arr;
}

try {
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvData);

  // Headers: Sector, Industry, SICS_Code, Topic, Metric, Category, Unit_of_Measure, Code
  const headers = rows[0].map((h) => h.trim());

  const taxonomyMap = new Map(); // Sector -> Set(Industry)
  const topicsMap = {}; // Sector -> Industry -> Set(Topic)
  const metricsMap = {}; // Industry -> Array(Metric)

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < headers.length) continue;

    const sector = row[0].trim();
    const industry = row[1].trim();
    const topic = row[3].trim();
    const metric = row[4].trim();
    const category = row[5].trim();
    const unit = row[6].trim();
    const code = row[7].trim();

    if (!sector || !industry) continue;

    // Populate Taxonomy
    if (!taxonomyMap.has(sector)) taxonomyMap.set(sector, new Set());
    taxonomyMap.get(sector).add(industry);

    // Populate Topics
    if (!topicsMap[sector]) topicsMap[sector] = {};
    if (!topicsMap[sector][industry]) topicsMap[sector][industry] = new Set();
    if (topic) topicsMap[sector][industry].add(topic);

    // Populate Metrics
    if (!metricsMap[industry]) metricsMap[industry] = [];
    if (metric) {
      metricsMap[industry].push({
        topic,
        metric,
        category:
          category === "Quantitative"
            ? "Quantitative"
            : "Discussion and Analysis",
        unit,
        code,
      });
    }
  }

  let tsContent = `export interface SasbSector {
  id: string;
  name: string;
  industries: string[];
}

export type SasbMetricCategory = "Quantitative" | "Discussion and Analysis";

export interface SasbMetric {
  topic: string;
  metric: string;
  category: SasbMetricCategory;
  unit: string;
  code: string;
}

// ----------------------------------------------------------------------
// SASB Taxonomy
// ----------------------------------------------------------------------
export const SASB_TAXONOMY: SasbSector[] = [\n`;

  const sectors = Array.from(taxonomyMap.keys()).sort();

  for (const sector of sectors) {
    const id = sector
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/_+$/, "");
    const industries = Array.from(taxonomyMap.get(sector)).sort();

    tsContent += `  {
    id: "${id}",
    name: ${JSON.stringify(sector)},
    industries: ${JSON.stringify(industries, null, 6).replace(/\]/g, "    ]")},
  },\n`;
  }

  tsContent += `];\n\n`;
  tsContent += `// ----------------------------------------------------------------------
// Materiality Topics mapping
// ----------------------------------------------------------------------\n`;

  const plainTopicsMap = {};
  for (const sector of Object.keys(topicsMap).sort()) {
    plainTopicsMap[sector] = {};
    for (const industry of Object.keys(topicsMap[sector]).sort()) {
      plainTopicsMap[sector][industry] = Array.from(
        topicsMap[sector][industry],
      );
    }
  }

  tsContent +=
    `export const SASB_MATERIALITY_TOPICS: Record<string, Record<string, string[]>> = ` +
    JSON.stringify(plainTopicsMap, null, 2) +
    `;\n\n`;

  tsContent += `// ----------------------------------------------------------------------
// Industry Metrics mapping
// ----------------------------------------------------------------------\n`;

  tsContent +=
    `export const SASB_INDUSTRY_METRICS: Record<string, SasbMetric[]> = ` +
    JSON.stringify(metricsMap, null, 2) +
    `;\n`;

  fs.writeFileSync(outPath, tsContent);
  console.log("Successfully generated " + outPath);
} catch (error) {
  console.error("Error generating TS file:", error);
}
