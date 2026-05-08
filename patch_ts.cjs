const fs = require('fs');
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let txt = fs.readFileSync(file, 'utf8');

// Fix typing for XLSX results
txt = txt.replace('const s1Data = workbook.Sheets[\"S1_Financial_Asset_Data\"] ? XLSX.utils.sheet_to_json(workbook.Sheets[\"S1_Financial_Asset_Data\"]) : [];', 'const s1Data = workbook.Sheets[\"S1_Financial_Asset_Data\"] ? XLSX.utils.sheet_to_json<any>(workbook.Sheets[\"S1_Financial_Asset_Data\"]) : [];');
txt = txt.replace('const s2Data = workbook.Sheets[\"S2_Counterparty_Profile\"] ? XLSX.utils.sheet_to_json(workbook.Sheets[\"S2_Counterparty_Profile\"]) : [];', 'const s2Data = workbook.Sheets[\"S2_Counterparty_Profile\"] ? XLSX.utils.sheet_to_json<any>(workbook.Sheets[\"S2_Counterparty_Profile\"]) : [];');
txt = txt.replace('const s3Data = workbook.Sheets[\"S3_GHG_Reported\"] ? XLSX.utils.sheet_to_json(workbook.Sheets[\"S3_GHG_Reported\"]) : [];', 'const s3Data = workbook.Sheets[\"S3_GHG_Reported\"] ? XLSX.utils.sheet_to_json<any>(workbook.Sheets[\"S3_GHG_Reported\"]) : [];');
txt = txt.replace('const s4Data = workbook.Sheets[\"S4_Activity_Reported\"] ? XLSX.utils.sheet_to_json(workbook.Sheets[\"S4_Activity_Reported\"]) : [];', 'const s4Data = workbook.Sheets[\"S4_Activity_Reported\"] ? XLSX.utils.sheet_to_json<any>(workbook.Sheets[\"S4_Activity_Reported\"]) : [];');

txt = txt.replace('const s2 = s2Data.find(x => x.counterparty === s1.counterparty) || {};', 'const s2 = s2Data.find((x: any) => x.counterparty === s1.counterparty) || {} as any;');
txt = txt.replace('const s3 = s3Data.find(x => x.counterparty === s1.counterparty) || {};', 'const s3 = s3Data.find((x: any) => x.counterparty === s1.counterparty) || {} as any;');
txt = txt.replace('const s4 = s4Data.find(x => x.counterparty === s1.counterparty) || {};', 'const s4 = s4Data.find((x: any) => x.counterparty === s1.counterparty) || {} as any;');

txt = txt.replace('const merged = s1Data.map((s1, index) => {', 'const merged = s1Data.map((s1: any, index: number) => {');

// We can just ignore the unused variable warnings or fix them. For speed, I'll ignore unused variables. Or just replace "dragOver" with "/* eslint-disable */" No wait.
fs.writeFileSync(file, txt);
console.log('Fixed types');
