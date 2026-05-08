const fs = require("fs");
const path = require("path");

let txt = fs.readFileSync(
  path.join(__dirname, "src/features/sustainability/pages/EmissionsModule.tsx"),
  "utf8",
);

// The styling overrides
txt = txt.replace(
  /className=\"px-4 py-3 bg-\\[#86bc25\\] text-white hover:bg-\\[#6c9c1b\\] text-\\[14px\\]/g,
  'className=\"px-6 py-2 bg-[#86bc25] text-white hover:bg-[#6c9c1b] text-[13px] rounded-none',
);
txt = txt.replace(
  /className=\"px-4 py-3 bg-\\[#86bc25\\] text-white hover:bg-\\[#6c9c1b\\] text-\\[14px\\] font-medium transition-colors disabled:bg-\\[#c6c6c6\\] disabled:text-\\[#8d8d8d\\] rounded-sm\"/g,
  'className=\"px-6 py-2 bg-[#86bc25] text-white hover:bg-[#6c9c1b] text-[13px] rounded-none font-medium transition-colors disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d]\"',
);

const startTgt = "const merged = (s1DataState?.data || []).map(";
const endTgt = "setPortfolioAssets((prev) => [...prev, ...merged]);";
const sIdx = txt.indexOf(startTgt);
const eIdx = txt.indexOf(endTgt);

if (sIdx !== -1 && eIdx !== -1) {
  const newBlock = `const merged = (s1DataState?.data || []).map((s1, index) => {
                              const cpStr = String(s1['Counterparty / Asset'] || s1['Counterparty Name'] || s1.Counterparty || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                              
                              const s2 = (s2DataState?.data || []).find((x) => String(x['Counterparty Name'] || x.counterparty || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cpStr) || {};
                              const s3 = (s3DataState?.data || []).find((x) => String(x['Counterparty Name'] || x.counterparty || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cpStr) || {};
                              const s4 = (s4DataState?.data || []).find((x) => String(x['Counterparty Name'] || x.counterparty || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() === cpStr) || {};

                              const getVal = (obj, str) => { const pair = Object.entries(obj).find(([k]) => k.toLowerCase().includes(str) && !k.toLowerCase().includes('?')); return pair && pair[1] ? parseFloat('' + pair[1].toString().replace(/,/g, '')) : 0; };

                              let exp = getVal(s1, 'exposure') || parseFloat('' + (s1.Exposure || '0').toString().replace(/,/g, '')) || 0;
                              let denom = getVal(s1, 'denominator') || getVal(s2, 'debt') || parseFloat('' + (s2.denominator || '1').toString().replace(/,/g, '')) || 1;
                              let ghg = getVal(s3, 'total s1+s2') || getVal(s3, 'total') || parseFloat('' + (s3.ghgReported || '0').toString().replace(/,/g, '')) || 0;

                              const actS1Pair = Object.entries(s4).find(([k]) => k.toLowerCase().includes('est. s1') || k.toLowerCase().includes('est s1'));
                              let activityS1 = (actS1Pair && actS1Pair[1]) ? parseFloat('' + actS1Pair[1].toString().replace(/,/g, '')) : (parseFloat('' + (s4.activityDiesel || '0').toString().replace(/,/g, '')) || 0);

                              const actS2Pair = Object.entries(s4).find(([k]) => k.toLowerCase().includes('est. s2') || k.toLowerCase().includes('est s2'));
                              let activityS2 = (actS2Pair && actS2Pair[1]) ? parseFloat('' + actS2Pair[1].toString().replace(/,/g, '')) : (parseFloat('' + (s4.activityElectricity || '0').toString().replace(/,/g, '')) || 0);

                              if (isNaN(activityS1)) activityS1 = 0;
                              if (isNaN(activityS2)) activityS2 = 0;
                              const activity = activityS1 + activityS2;

                              let emissions = 0; let dqs = 5; let option = 'Option 3';
                              
                              const dqsPair = Object.entries(s3).find(([k]) => k.toLowerCase().includes('verified'));
                              const rawDqsCheck = String(dqsPair && dqsPair[1] ? dqsPair[1] : '').toLowerCase();

                              if (ghg > 0) {
                                emissions = ghg; dqs = rawDqsCheck.includes('y') || rawDqsCheck.includes('1') ? 1 : 2; option = 'Option 1';
                              } else if (activity > 0) {
                                emissions = activity; dqs = 3; option = 'Option 2';
                              } else {
                                const revPair = Object.entries(s2).find(([k]) => k.toLowerCase().includes('revenue'));
                                const rev = (revPair && revPair[1]) ? parseFloat('' + revPair[1].toString().replace(/,/g, '')) : (parseFloat('' + (s2.annualRevenue || '0').toString().replace(/,/g, '')) || 0);
                                const secPair = Object.entries(s2).find(([k]) => k.toLowerCase().includes('sector'));
                                const sec = (secPair && secPair[1]) ? secPair[1] : (s2.sector || 'Unclassified');
                                const intensity = MRIO_SECTOR_INTENSITIES[sec] || 15.2;
                                emissions = rev * intensity; dqs = 4; option = 'Option 3';
                              }

                              const secNameEntry = Object.entries(s2).find(([k]) => k.toLowerCase().includes('sector'));
                              const assetClassEntry = Object.entries(s1).find(([k]) => k.toLowerCase().includes('asset class'));
                              const basisEntry = Object.entries(s1).find(([k]) => k.toLowerCase().includes('basis'));
                              const isicEntry = Object.entries(s2).find(([k]) => k.toLowerCase().includes('isic'));
                              const revOutputEntry = Object.entries(s2).find(([k]) => k.toLowerCase().includes('revenue'));

                              return {
                                id: 'xl-' + Date.now() + '-' + index,
                                counterparty: s1['Counterparty / Asset'] || s1['Counterparty Name'] || s1.Counterparty || 'Unknown',
                                assetClass: (assetClassEntry && assetClassEntry[1]) ? assetClassEntry[1] : 'Corporate Loan',
                                sector: (secNameEntry && secNameEntry[1]) ? secNameEntry[1] : (s2.sector || 'Unclassified'),
                                isicCode: (isicEntry && isicEntry[1]) ? isicEntry[1] : '',
                                exposure: exp,
                                denominator: denom,
                                denominatorBasis: (basisEntry && basisEntry[1]) ? basisEntry[1] : 'Debt',
                                annualRevenue: (revOutputEntry && revOutputEntry[1]) ? parseFloat('' + revOutputEntry[1].toString().replace(/,/g, '')) : 0,
                                ghgReported: ghg,
                                ghgVerified: dqs === 1,
                                activityDiesel: activityS1,
                                financedEmissions: isNaN(emissions) ? 0 : emissions,
                                dqs: dqs, option: option, attributionFactor: denom === 0 ? 0 : exp / denom,
                                isGovernmentBond: ((assetClassEntry && assetClassEntry[1]) ? assetClassEntry[1] : '') === 'Government Bond',
                                govtConsumptionEmissions: 0,
                              };
                            });\n                          `;
  txt = txt.substring(0, sIdx) + newBlock + txt.substring(eIdx);
}

fs.writeFileSync(
  path.join(__dirname, "src/features/sustainability/pages/EmissionsModule.tsx"),
  txt,
);
console.log("PATCH APPLIED");
