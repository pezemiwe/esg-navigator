const fs = require("fs");
const file = "src/features/sustainability/pages/EmissionsModule.tsx";
let txt = fs.readFileSync(file, "utf8");

const newUpload = `
    const handleSingleFileUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: React.Dispatch<React.SetStateAction<any[]>>,
    ) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        
        const rawJson = XLSX.utils.sheet_to_json<any>(workbook.Sheets[firstSheetName], { header: 1 });
        let headerRowIndex = 0;
        for (let i = 0; i < Math.min(10, rawJson.length); i++) {
          const rowValues = Object.values(rawJson[i] || {}).map(v => String(v).toLowerCase());
          if (rowValues.some(v => v.includes("counterparty") || v.includes("asset class"))) {
            headerRowIndex = i;
            break;
          }
        }
        
        const sheetData = XLSX.utils.sheet_to_json<any>(workbook.Sheets[firstSheetName], {
          range: headerRowIndex
        });
        
        const normalizedData = sheetData.map(row => {
            const out:any = {};
            for (let k in row) {
                const norm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                out[norm] = row[k];
            }
            return out;
        });

        setter(normalizedData);
      } catch (error) {
        setCsvError("Failed to parse file.");
      } finally {
        e.target.value = "";
      }
    };
`;

const regexUpload = /const handleSingleFileUpload = async \([\s\S]*?e\.target\.value = "";\n    \};/;
txt = txt.replace(regexUpload, newUpload.trim());

const newProcess = `
  const handleProcessPortfolio = () => {
    if (s1Data.length === 0) return;

    const merged = s1Data.map((s1: any, index: number) => {
      const getVal = (obj: any, keys: string[]) => {
        if (!obj) return undefined;
        for (const k of keys) {
          if (obj[k] !== undefined) return obj[k];
        }
        return undefined;
      };

      const cp = getVal(s1, ["counterpartyasset", "counterpartyname", "counterparty"]) || "Unknown";
      
      const s2 = s2Data.find((x: any) => {
          const c2 = getVal(x, ["counterpartyasset", "counterpartyname", "counterparty"]);
          return c2 === cp;
      }) || ({} as any);
      
      const s3 = s3Data.find((x: any) => {
          const c3 = getVal(x, ["counterpartyasset", "counterpartyname", "counterparty"]);
          return c3 === cp;
      }) || ({} as any);
      
      const s4 = s4Data.find((x: any) => {
          const c4 = getVal(x, ["counterpartyasset", "counterpartyname", "counterparty"]);
          return c4 === cp;
      }) || ({} as any);

      const acClass = getVal(s1, ["assetclass"]) || "Term Loan";
      const isGovt = acClass === "Government Bond";

      const exposureRaw = getVal(s1, ["exposuremauto", "exposure"]);
      const exposure = parseFloat(String(exposureRaw).replace(/,/g, "")) || 0;

      const deRaw = getVal(s1, ["denominatormauto", "denominator"]) || getVal(s2, ["evicmauto", "totaldebtmauto"]);
      const denominator = parseFloat(String(deRaw).replace(/,/g, "")) || 0;

      const revRaw = getVal(s2, ["revenuemauto", "revenue"]);
      const annualRevenue = parseFloat(String(revRaw).replace(/,/g, "")) || 0;

      const ghgRaw = getVal(s3, ["totals1s2tcoe", "totals1s2", "ghgreported"]);
      const ghgReported = parseFloat(String(ghgRaw).replace(/,/g, "")) || 0;

      const diesel = parseFloat(String(getVal(s4, ["diesellitres", "diesel"])).replace(/,/g, "")) || 0;
      const petrol = parseFloat(String(getVal(s4, ["petrollitres", "petrol"])).replace(/,/g, "")) || 0;
      const elec = parseFloat(String(getVal(s4, ["electricitykwh", "electricity"])).replace(/,/g, "")) || 0;

      return {
        id: "xl-" + Date.now() + "-" + index,
        counterparty: cp,
        assetClass: acClass,
        sector: getVal(s2, ["sector27sectors", "sector"]) || "SME / General (Unclassified)",
        isicCode: String(getVal(s2, ["isiccode"])) || "",
        exposure: exposure,
        denominator: denominator,
        denominatorBasis: getVal(s1, ["denominatorbasis"]) || "Total Debt",
        annualRevenue: annualRevenue,
        ghgReported: ghgReported,
        ghgVerified: String(getVal(s3, ["thirdpartyverifiedyn", "ghgverified"])).toUpperCase() === "Y",
        activityDiesel: diesel,
        activityPetrol: petrol,
        activityElectricity: elec,
        isGovernmentBond: isGovt,
        govtConsumptionEmissions: isGovt ? (parseFloat(String(getVal(s2, ["govtconsumptionemissionstcoe"]))) || 100) : 0,
      };
    });

    setPortfolioAssets((prev) => {
       const existing = prev.filter(p => !p.id.startsWith("xl-"));
       return [...existing, ...merged];
    });
  };
`;
const regexProcess = /const handleProcessPortfolio = \(\) => \{[\s\S]*?setPortfolioAssets\(\(prev\) => \[\.\.\.prev, \.\.\.merged\]\);\n    \};/;
txt = txt.replace(regexProcess, newProcess.trim());

fs.writeFileSync(file, txt);
console.log("Done patch");

