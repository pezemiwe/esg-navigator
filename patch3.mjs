import fs from 'fs';
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let txt = fs.readFileSync(file, 'utf8');

const sIdx = txt.indexOf('<div className=\"bg-white border border-[#e0e0e0] flex items-center justify-between px-6 py-6 mb-6\">');
const eIdx = txt.indexOf('{/* STEP 4: DASHBOARD / METRICS */}', sIdx);

const replacement = \
                  <div className="bg-white border border-[#e0e0e0] flex flex-col px-6 py-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-[20px] font-normal text-[#161616]">
                          PCAF Financed Modules (Scope 3)
                        </h2>
                        <p className="text-[14px] text-[#525252] mt-1">
                          Upload the respective datasets to automatically cascade through Option 1-4 calculations.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            const mockData = [
                              { id: "mock-1", counterparty: "Mock Alpha Corp", assetClass: "Term Loan", sector: "Manufacturing", isicCode: "2710", exposure: 15, denominator: 30, denominatorBasis: "Total Debt", ghgReported: 450, ghgVerified: true },
                              { id: "mock-2", counterparty: "Mock Beta Logistics", assetClass: "Project Loan", sector: "Transport", isicCode: "4923", exposure: 200, denominator: 500, denominatorBasis: "EVIC", annualRevenue: 250, activityDiesel: 120000 },
                              { id: "mock-3", counterparty: "NIGERIAN GOVT", assetClass: "Government Bond", sector: "Government", isicCode: "-", exposure: 50, denominator: 50, denominatorBasis: "GDP", isGovernmentBond: true, govtConsumptionEmissions: 10000 },
                              { id: "mock-4", counterparty: "Generic Retail Co", assetClass: "Business Loan", sector: "Retail", isicCode: "4711", exposure: 5, denominator: 25, denominatorBasis: "Total Debt", annualRevenue: 10 }
                            ];
                            setPortfolioAssets(mockData);
                          }}
                          className="px-4 py-3 bg-[#e5e5e5] text-[#161616] hover:bg-[#d0d0d0] text-[14px] font-medium transition-colors"
                        >
                          Use Sample Data
                        </button>
                        <button
                          disabled={s1DataState.length === 0 || s2DataState.length === 0}
                          onClick={() => {
                            const merged = s1DataState.map((s1, index) => {
                              const s2 = s2DataState.find((x: any) => x.counterparty === s1.counterparty) || {};
                              const s3 = s3DataState.find((x: any) => x.counterparty === s1.counterparty) || {};
                              const s4 = s4DataState.find((x: any) => x.counterparty === s1.counterparty) || {};
                              return {
                                id: "xl-" + Date.now() + "-" + index,
                                counterparty: s1.counterparty || "Unknown",
                                assetClass: s1.assetClass || "Term Loan",
                                sector: s2.sector || "SME / General (Unclassified)",
                                isicCode: s2.isicCode || "",
                                exposure: parseFloat(s1.exposure) || 0,
                                denominator: parseFloat(s2.denominator) || 0,
                                denominatorBasis: s2.denominatorBasis || "Total Debt",
                                annualRevenue: parseFloat(s2.annualRevenue) || 0,
                                ghgReported: parseFloat(s3.ghgReported) || 0,
                                ghgVerified: !!s3.ghgVerified,
                                activityDiesel: parseFloat(s4.activityDiesel) || 0,
                                activityPetrol: parseFloat(s4.activityPetrol) || 0,
                                activityElectricity: parseFloat(s4.activityElectricity) || 0,
                                isGovernmentBond: s1.assetClass === "Government Bond",
                                govtConsumptionEmissions: s1.assetClass === "Government Bond" ? (parseFloat(s3.govtConsumptionEmissions) || 100) : 0
                              };
                            });
                            setPortfolioAssets(prev => [...prev, ...merged]);
                            setS1DataState([]); setS2DataState([]); setS3DataState([]); setS4DataState([]);
                          }}
                          className="px-4 py-3 bg-[#86bc25] text-white hover:bg-[#435e12] text-[14px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Compile & Generate Results
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 1, req: true, label: "S1_Financial_Asset_Data", desc: "Counterparty exposures", state: s1DataState, setter: setS1DataState, ref: fileParseS1Context },
                        { id: 2, req: true, label: "S2_Counterparty_Profile", desc: "Identifiers & MRIO mapping", state: s2DataState, setter: setS2DataState, ref: fileParseS2Context },
                        { id: 3, req: false, label: "S3_GHG_Reported", desc: "Submitted direct footprint", state: s3DataState, setter: setS3DataState, ref: fileParseS3Context },
                        { id: 4, req: false, label: "S4_Activity_Reported", desc: "Energy & combustion records", state: s4DataState, setter: setS4DataState, ref: fileParseS4Context },
                      ].map(sheet => (
                        <div key={sheet.id} className="flex items-center justify-between p-4 border border-[#e0e0e0] bg-[#f4f4f4]">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {sheet.state.length > 0 ? (
                                <Check size={16} className="text-[#86bc25]" />
                              ) : sheet.req ? (
                                <span className="w-2 h-2 rounded-full bg-[#da1e28]"></span>
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-[#0f62fe]"></span>
                              )}
                              <strong className="text-[14px] font-medium text-[#161616]">{sheet.label}</strong>
                            </div>
                            <p className="text-[12px] text-[#525252] pl-6 flex items-center gap-2">
                              {sheet.desc} • {sheet.req ? "Required" : "Optional"} 
                              {sheet.state.length > 0 && <span className="text-[#86bc25] font-bold">({sheet.state.length} entries)</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => (sheet.ref as any).current?.click()}
                            className="bg-white border border-[#e0e0e0] px-3 py-1.5 text-[12px] hover:bg-[#e0e0e0] transition-colors flex items-center gap-2 font-medium"
                          >
                            <Upload size={14} /> Upload CSV/XLSX
                          </button>
                          <input
                            ref={sheet.ref as any}
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              try {
                                const data = await f.arrayBuffer();
                                const workbook = window.XLSX ? window.XLSX.read(data, {type: "array"}) : XLSX.read(data, {type: "array"});
                                const first = workbook.SheetNames[0];
                                const json = window.XLSX ? window.XLSX.utils.sheet_to_json(workbook.Sheets[first]) : XLSX.utils.sheet_to_json(workbook.Sheets[first]);
                                sheet.setter(json);
                              } catch (err) {
                                console.error(err);
                              } finally {
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
              \;

if(sIdx !== -1 && eIdx !== -1) {
    let newTxt = txt.substring(0, sIdx) + replacement + txt.substring(eIdx);

    if (!newTxt.includes('const [s1DataState, setS1DataState]')) {
        newTxt = newTxt.replace('const [s3Modal, setS3Modal] = useState(false);', \const [s3Modal, setS3Modal] = useState(false);
  const [s1DataState, setS1DataState] = useState<any[]>([]);
  const [s2DataState, setS2DataState] = useState<any[]>([]);
  const [s3DataState, setS3DataState] = useState<any[]>([]);
  const [s4DataState, setS4DataState] = useState<any[]>([]);
  const fileParseS1Context = useRef<HTMLInputElement>(null);
  const fileParseS2Context = useRef<HTMLInputElement>(null);
  const fileParseS3Context = useRef<HTMLInputElement>(null);
  const fileParseS4Context = useRef<HTMLInputElement>(null);
\);
    }

    fs.writeFileSync(file, newTxt);
    console.log('patched bounds');
} else {
    console.log('could not find bounds', sIdx, eIdx);
}
