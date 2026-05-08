const fs = require('fs');
let txt = fs.readFileSync('src/features/sustainability/pages/EmissionsModule.tsx', 'utf8');

const sIdx = txt.indexOf('            {/* STEP 3: SCOPE 3 (Portfolio) */}');
const eIdx = txt.indexOf('{/* STEP 4: DASHBOARD / METRICS */}');
let eTarget = '{/* STEP 4: DASHBOARD / METRICS */}';
let actualEnd = eIdx;

if (actualEnd === -1) {
  // It seems STEP 4 was removed or renamed. Let's find step === 3
  const step3 = txt.indexOf('            {step === 3 && (');
  actualEnd = step3;
}

if (sIdx === -1 || actualEnd === -1) {
  console.log("Could not find start or end!");
  process.exit();
}

const replacement = `            {/* STEP 3: SCOPE 3 (Portfolio) */}
            {step === 2 && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-white border border-[#e0e0e0] flex flex-col mb-6">
                  <div className="px-6 py-6 border-b border-[#e0e0e0] flex items-center justify-between">
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
                            { id: "mock-2", counterparty: "Mock Beta Logistics", assetClass: "Project Loan", sector: "Transport", isicCode: "4923", exposure: 200, denominator: 500, denominatorBasis: "EVIC", annualRevenue: 250, activityDiesel: 120000 }
                          ];
                          setPortfolioAssets(mockData);
                        }}
                        className="px-4 py-3 bg-[#e5e5e5] text-[#161616] hover:bg-[#d0d0d0] text-[14px] font-medium transition-colors"
                      >
                        Use Sample Data
                      </button>
                      <button
                        disabled={!s1DataState || !s2DataState}
                        onClick={() => {
                          const merged = (s1DataState?.data || []).map((s1, index) => {
                            const s2 = (s2DataState?.data || []).find((x: any) => x.counterparty === s1.counterparty) || {};
                            const s3 = (s3DataState?.data || []).find((x: any) => x.counterparty === s1.counterparty) || {};
                            const s4 = (s4DataState?.data || []).find((x: any) => x.counterparty === s1.counterparty) || {};
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
                          setS1DataState(null); setS2DataState(null); setS3DataState(null); setS4DataState(null);
                        }}
                        className="px-4 py-3 bg-[#86bc25] text-white hover:bg-[#70a31d] text-[14px] font-medium transition-colors disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d]"
                      >
                        Compile Results
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 1, req: true, label: "Financial Asset Data", key: "S1_Financial_Asset_Data", desc: "Counterparty exposures", state: s1DataState, setter: setS1DataState, ref: fileParseS1Context },
                      { id: 2, req: true, label: "Counterparty Profile", key: "S2_Counterparty_Profile", desc: "Identifiers & MRIO mapping", state: s2DataState, setter: setS2DataState, ref: fileParseS2Context },
                      { id: 3, req: false, label: "GHG Reported", key: "S3_GHG_Reported", desc: "Submitted direct footprint", state: s3DataState, setter: setS3DataState, ref: fileParseS3Context },
                      { id: 4, req: false, label: "Activity Reported", key: "S4_Activity_Reported", desc: "Energy & combustion records", state: s4DataState, setter: setS4DataState, ref: fileParseS4Context },
                    ].map((sheet) => (
                      <div key={sheet.id} className="flex items-center justify-between p-4 border border-[#e0e0e0] bg-[#f4f4f4]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {sheet.state ? (
                              <Check className="text-[#86bc25] w-4 h-4" />
                            ) : sheet.req ? (
                              <span className="w-2 h-2 rounded-full bg-[#da1e28]"></span>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-[#0f62fe]"></span>
                            )}
                            <strong className="text-[14px] font-medium text-[#161616]">{sheet.label}</strong>
                            <span className="text-[10px] uppercase font-bold text-[#8d8d8d] px-1.5 py-0.5 bg-[#e5e5e5]">
                              {sheet.req ? "Required" : "Optional"}
                            </span>
                          </div>
                          
                          {sheet.state ? (
                            <p className="text-[13px] text-[#161616] pl-6 flex flex-col gap-0.5">
                              <span className="font-semibold text-[#86bc25]">File: {sheet.state.name}</span>
                              <span className="text-[#525252]">{sheet.state.data.length} records parsed</span>
                            </p>
                          ) : (
                            <p className="text-[12px] text-[#525252] pl-6">
                              {sheet.desc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => (sheet.ref).current?.click()}
                            className="bg-white border border-[#e0e0e0] px-3 py-1.5 text-[12px] hover:bg-[#e0e0e0] transition-colors flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" /> 
                            {sheet.state ? "Replace" : "Upload"}
                          </button>

                          {sheet.state && (
                            <button
                              onClick={() => sheet.setter(null)}
                              className="text-[#da1e28] hover:bg-[#ffe5e5] p-1.5 transition-colors border border-transparent hover:border-[#da1e28]"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <input
                            ref={sheet.ref}
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
                                sheet.setter({ name: f.name, data: json });
                              } catch (err) {
                                console.error(err);
                              } finally {
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {portfolioAssets.length > 0 ? (
                  <div className="bg-white border border-[#e0e0e0] p-0 mb-6">
                    <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4] flex justify-between items-center">
                      <h3 className="text-[16px] font-medium text-[#161616]">
                        Financed Emissions Results Table
                      </h3>
                      <button
                        onClick={() => setPortfolioAssets([])}
                        className="text-[#da1e28] text-[13px] font-medium flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={14} /> Clear Portfolio
                      </button>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left text-[13px]">
                        <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0 font-medium">
                          <tr>
                            <th className="px-4 py-3">Counterparty</th>
                            <th className="px-4 py-3">Asset Class</th>
                            <th className="px-4 py-3">Option Path</th>
                            <th className="px-4 py-3">DQS</th>
                            <th className="px-4 py-3 text-right">
                              Exposure ($m)
                            </th>
                            <th className="px-4 py-3 text-right">
                              Attribution %
                            </th>
                            <th className="px-4 py-3 text-right">
                              Financed (tCO2e)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolioResults.map((p) => (
                            <tr
                              key={p.id}
                              className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                            >
                              <td className="px-4 py-3 font-medium text-[#161616]">
                                {p.counterparty}
                              </td>
                              <td className="px-4 py-3 text-[#525252]">
                                {p.assetClass}
                              </td>
                              <td className="px-4 py-3 text-[#525252]">
                                {p.option}
                              </td>
                              <td className="px-4 py-3 text-[#525252]">
                                {p.dqs}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {formatNumber(p.exposure)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono">
                                {(p.attributionFactor * 100).toFixed(2)}%
                              </td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-[#161616]">
                                {formatNumber(p.financedEmissions)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-[#e0e0e0] p-12 flex flex-col items-center justify-center text-center mb-6">
                    <Building2 className="w-12 h-12 text-[#cccccc] mb-4" />
                    <h3 className="text-[16px] font-medium text-[#161616] mb-1">
                      No Financed Emissons Data
                    </h3>
                    <p className="text-[14px] text-[#525252]">
                      Upload your datasets or load the sample data to compile and view results.
                    </p>
                  </div>
                )}
              </div>
            )}
\n`;

txt = txt.substring(0, sIdx) + replacement + txt.substring(actualEnd);
fs.writeFileSync('src/features/sustainability/pages/EmissionsModule.tsx', txt);
console.log('Script finish');
