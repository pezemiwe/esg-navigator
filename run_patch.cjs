const fs = require('fs');
let txt = fs.readFileSync('src/features/sustainability/pages/EmissionsModule.tsx', 'utf8');

const sIdx = txt.indexOf('            {/* STEP 3: SCOPE 3 (Portfolio) */}');
const eIdx = txt.indexOf('{s1Modal && (');

if (sIdx === -1 || eIdx === -1) {
  console.log('Indexes not found', sIdx, eIdx);
  process.exit(1);
}

// Rewind back to "        </main>"
const targetStr = '        </main>\n      </div>\n\n      {/* ---------------- MODALS (CARBON STYLE) ---------------- */}';
const actualEIdx = txt.lastIndexOf(targetStr, eIdx);
if (actualEIdx === -1) {
  console.log('Could not find exact split point');
  process.exit(1);
}

const replacement = `            {/* STEP 3: SCOPE 3 (Portfolio) */}
            {step === 2 && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-white border border-[#e0e0e0] flex flex-col mb-6">
                  <div className="px-6 py-6 border-b border-[#e0e0e0] flex items-center justify-between">
                    <div>
                      <h2 className="text-[20px] font-normal text-[#161616]">
                        Financed Emissions Data Integration
                      </h2>
                      <p className="text-[14px] text-[#525252] mt-1">
                        Upload the required datasets to calculate Scope 3 financed emissions according to PCAF standards.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        title="Ensure all datasets are uploaded exactly as named to compile without mock values"
                        disabled={!s1DataState || !s2DataState}
                        onClick={() => {
                          const merged = (s1DataState?.data || []).map((s1, index) => {
                            const s2 = (s2DataState?.data || []).find((x) => x["Counterparty Name"] === s1["Counterparty / Asset"] || x["Counterparty Name"] === s1["Counterparty Name"] || x.counterparty === s1.counterparty) || {};
                            const s3 = (s3DataState?.data || []).find((x) => x["Counterparty Name"] === s1["Counterparty / Asset"] || x.counterparty === s1.counterparty) || {};
                            const s4 = (s4DataState?.data || []).find((x) => x["Counterparty Name"] === s1["Counterparty / Asset"] || x.counterparty === s1.counterparty) || {};
                            
                            const exp = parseFloat(s1["Exposure($m � auto)"] || s1["Exposure($m — auto)"] || s1.Exposure || s1.exposure) || 0;
                            const denom = parseFloat(s1["Denominator($m � auto)"] || s1["Denominator($m — auto)"] || s2["Total Debt($m auto)"] || s2.denominator) || 1;
                            const ghg = parseFloat(s3["Total S1+S2(tCO2e)"] || s3["Total S1+S2(tCO?e)"] || s3.ghgReported) || 0;
                            
                            let activityS1 = parseFloat(s4["Est. S1(tCO2e)[S6 Referenced]"] || s4["Est. S1(tCO?e)[S6 Referenced]"] || s4["Est. S1(tCO?e)"] || s4.activityDiesel);
                            let activityS2 = parseFloat(s4["Est. S2(tCO2e)[S6 Referenced]"] || s4["Est. S2(tCO?e)[S6 Referenced]"] || s4["Est. S2(tCO?e)"] || s4.activityElectricity);
                            
                            if(isNaN(activityS1)) activityS1 = 0;
                            if(isNaN(activityS2)) activityS2 = 0;
                            const activity = activityS1 + activityS2;

                            let emissions = 0;
                            let dqs = 5;
                            let option = "Option 3";

                            if (ghg > 0) {
                              emissions = (exp / denom) * ghg;
                              dqs = s3["Third-Party Verified? (Y/N)"] === 'Y' ? 1 : 2;
                              option = "Option 1 (GHG)";
                            } else if (activity > 0) {
                              emissions = (exp / denom) * activity;
                              dqs = 3;
                              option = "Option 2 (Est)";
                            } else {
                              emissions = exp * 15.5; 
                              dqs = 4;
                            }

                            return {
                              id: "xl-" + Date.now() + "-" + index,
                              counterparty: s1["Counterparty / Asset"] || s1["Counterparty Name"] || s1.Counterparty || "Unknown",
                              assetClass: s1["Asset Class"] || "Corporate Loan",
                              sector: s2["Sector (27 Sectors)"] || s2.sector || "Unclassified",
                              isicCode: s2["ISIC Code"] || s2.isicCode || "",
                              exposure: exp,
                              denominator: denom,
                              denominatorBasis: s1["Denominator Basis"] || s2.denominatorBasis || "Debt",
                              annualRevenue: parseFloat(s2["Revenue($m auto)"] || s2.annualRevenue) || 0,
                              ghgReported: ghg,
                              ghgVerified: s3["Third-Party Verified? (Y/N)"] === 'Y',
                              activityDiesel: parseFloat(s4["Diesel(litres)"] || 0),
                              financedEmissions: isNaN(emissions) ? 0 : emissions,
                              dqs: dqs,
                              option: option,
                              attributionFactor: exp / denom,
                              isGovernmentBond: s1["Asset Class"] === "Government Bond",
                              govtConsumptionEmissions: s1["Asset Class"] === "Government Bond" ? 100 : 0
                            };
                          });
                          
                          setPortfolioAssets(prev => [...prev, ...merged]);
                          setS1DataState(null); setS2DataState(null); setS3DataState(null); setS4DataState(null);
                          setStep(3); 
                        }}
                        className="px-4 py-3 bg-[#0f62fe] text-white hover:bg-[#0353e9] text-[14px] font-medium transition-colors disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d]"
                      >
                        Process & Build Inventory
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 gap-4">
                    {[
                      { id: 1, req: true, label: "Financial Asset Data", desc: "Counterparty exposure, asset class, and denominator values.", state: s1DataState, setter: setS1DataState, ref: fileParseS1Context },
                      { id: 2, req: true, label: "Counterparty Profile", desc: "Sector classifications, revenue, and physical identifiers.", state: s2DataState, setter: setS2DataState, ref: fileParseS2Context },
                      { id: 3, req: false, label: "GHG Inventory Report", desc: "Reported footprint (Scope 1 & 2) and verification status.", state: s3DataState, setter: setS3DataState, ref: fileParseS3Context },
                      { id: 4, req: false, label: "Energy & Activity Data", desc: "Fuel consumption and electricity usage records.", state: s4DataState, setter: setS4DataState, ref: fileParseS4Context },
                    ].map((sheet) => (
                      <div key={sheet.id} className="flex items-center justify-between p-4 border border-[#e0e0e0] bg-[#f4f4f4] rounded-sm">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {sheet.state ? (
                              <div className="w-5 h-5 rounded-full bg-[#198038] flex items-center justify-center text-white">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : sheet.req ? (
                              <div className="w-5 h-5 rounded-full bg-[#da1e28] flex items-center justify-center text-white text-[10px] font-bold">!</div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#8d8d8d] flex items-center justify-center text-white text-[10px] font-bold">?</div>
                            )}
                            <strong className="text-[15px] font-medium text-[#161616]">{sheet.label}</strong>
                            <span className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-sm ${sheet.req ? "bg-[#ffe5e5] text-[#da1e28]" : "bg-[#e5e5e5] text-[#525252]"}`}>
                              {sheet.req ? "Required" : "Optional"}
                            </span>
                          </div>
                          
                          {sheet.state ? (
                            <div className="pl-8 flex flex-col gap-0.5 mt-2">
                              <span className="text-[13px] font-medium text-[#161616] bg-white border border-[#e0e0e0] px-2 py-1 inline-flex items-center w-fit gap-2">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-[#198038]" />
                                {sheet.state.name}
                              </span>
                              <span className="text-[12px] text-[#525252] mt-1">{sheet.state.data.length} valid records integrated</span>
                            </div>
                          ) : (
                            <p className="text-[13px] text-[#525252] pl-8 mt-1">
                              {sheet.desc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => (sheet.ref).current?.click()}
                            className={`\${sheet.state ? "bg-white text-[#161616] border-[#e0e0e0]" : "bg-[#161616] text-white border-transparent hover:bg-[#393939]"} border px-4 py-2 text-[13px] transition-colors flex items-center gap-2 font-medium cursor-pointer rounded-sm`}
                          >
                            <Upload className="w-4 h-4" /> 
                            {sheet.state ? "Replace File" : "Upload File"}
                          </button>

                          {sheet.state && (
                            <button
                              onClick={() => sheet.setter(null)}
                              className="text-[#da1e28] hover:bg-[#ffe5e5] p-2 transition-colors border border-transparent hover:border-[#da1e28] rounded-sm flex items-center gap-2 text-[13px] font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Remove
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
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-[24px] font-normal text-[#161616] leading-tight">
                      Portfolio Inventory Review
                    </h2>
                    <p className="text-[14px] text-[#525252] mt-1">
                      Displaying real-time analytical scorecards: Total Financed Emissions, Total Exposure, Emission Intensity Metrics, DQS Overview, Emissions by Sector and Asset Classes, Highest Emitter Tables.
                    </p>
                  </div>
                  <div className="flex gap-3">
                     <button
                        onClick={() => setStep(2)}
                        className="px-4 py-2 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-[#f4f4f4] text-[14px] font-medium transition-colors rounded-sm"
                      >
                        Back to Import
                      </button>
                      <button
                        className="px-4 py-2 bg-[#0f62fe] text-white hover:bg-[#0353e9] text-[14px] font-medium transition-colors rounded-sm flex items-center gap-2"
                      >
                         Export Report <Download className="w-4 h-4"/>
                      </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-6">
                  {[
                    { label: "Total Financed Emissions", value: financedTotal, suffix: "tCO2e", highlight: true },
                    { label: "Total Exposure", value: portfolioResults.reduce((a, b) => a + (b.exposure || 0), 0), suffix: "$M", highlight: false },
                    { label: "Emission Intensity Metrics", value: portfolioResults.reduce((a, b) => a + (b.exposure || 0), 0) > 0 ? (financedTotal / portfolioResults.reduce((a, b) => a + (b.exposure || 0), 0)) : 0, suffix: "tCO2e / $M", highlight: false },
                    { label: "Total Facilities", value: portfolioResults.length, suffix: "Loans/Assets", highlight: false }
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`p-6 flex flex-col justify-between ${stat.highlight ? "bg-[#f4fadc]" : "bg-white"}`}
                    >
                      <p
                        className={`text-[13px] uppercase font-semibold mb-6 tracking-wide ${stat.highlight ? "text-[#86bc25]" : "text-[#525252]"}`}
                      >
                        {stat.label}
                      </p>
                      <div>
                        <p
                          className={`text-[32px] font-light leading-none ${stat.highlight ? "text-[#435e12]" : "text-[#161616]"}`}
                        >
                          {stat.label === "Total Facilities" ? stat.value : formatNumber(stat.value)}
                        </p>
                        <p
                          className={`text-[13px] mt-1.5 font-medium ${stat.highlight ? "text-[#86bc25]" : "text-[#8d8d8d]"}`}
                        >
                          {stat.suffix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {portfolioResults.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                      
                      <div className="col-span-8 bg-white border border-[#e0e0e0] p-6">
                        <h3 className="text-[16px] font-medium text-[#161616] mb-8">
                          Emissions by Sector
                        </h3>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                               data={Object.entries(
                                portfolioResults.reduce(
                                  (acc, r) => {
                                    acc[r.sector] = (acc[r.sector] || 0) + r.financedEmissions;
                                    return acc;
                                  },
                                  {}
                                )
                              )
                                .map(([sector, val]) => ({ name: sector, value: val }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 7)}
                              layout="vertical"
                              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e0e0e0" />
                              <XAxis type="number" tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
                              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 12, fill: "#161616", fontWeight: 500 }} axisLine={false} tickLine={false} />
                              <Tooltip
                                cursor={{ fill: "#f4f4f4" }}
                                formatter={(val) => [formatNumber(val) + " tCO2e", "Emissions"]}
                                contentStyle={{ borderRadius: '4px', border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "13px" }}
                              />
                              <Bar dataKey="value" fill="#0f62fe" barSize={24} radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="col-span-4 bg-white border border-[#e0e0e0] p-6 flex flex-col">
                        <h3 className="text-[16px] font-medium text-[#161616] mb-6">
                          DQS Overview
                        </h3>
                        <div className="h-[240px] w-full flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(
                                  portfolioResults.reduce(
                                    (acc, r) => {
                                      acc[`Score ${r.dqs}`] = (acc[`Score ${r.dqs}`] || 0) + r.financedEmissions;
                                      return acc;
                                    },
                                    {}
                                  ),
                                ).map(([name, value]) => ({ name, value }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={105}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {Object.entries(
                                  portfolioResults.reduce(
                                    (acc, r) => {
                                      acc[`Score ${r.dqs}`] = (acc[`Score ${r.dqs}`] || 0) + r.financedEmissions;
                                      return acc;
                                    },
                                    {}
                                  ),
                                ).map((entry, idx) => (
                                  <Cell key={idx} fill={["#0f62fe", "#198038", "#8a3ffc", "#ff832b", "#da1e28"][idx % 5]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(val) => formatNumber(val)}
                                contentStyle={{ borderRadius: '4px', border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", fontSize: "13px" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#0f62fe] rounded-full"></div><span className="text-[12px] text-[#525252]">DQS 1 (Best)</span></div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#198038] rounded-full"></div><span className="text-[12px] text-[#525252]">DQS 2</span></div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#8a3ffc] rounded-full"></div><span className="text-[12px] text-[#525252]">DQS 3</span></div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ff832b] rounded-full"></div><span className="text-[12px] text-[#525252]">DQS 4</span></div>
                           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#da1e28] rounded-full"></div><span className="text-[12px] text-[#525252]">DQS 5 (Poor)</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                      <div className="col-span-5 bg-white border border-[#e0e0e0] p-6">
                        <h3 className="text-[16px] font-medium text-[#161616] mb-8">
                          Emissions by Asset Classes
                        </h3>
                        <div className="h-[280px]">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart
                               data={Object.entries(
                                portfolioResults.reduce(
                                  (acc, r) => {
                                    acc[r.assetClass] = (acc[r.assetClass] || 0) + r.financedEmissions;
                                    return acc;
                                  },
                                  {}
                                )
                              ).map(([name, val]) => ({ name, value: val })).sort((a,b) => b.value - a.value)}
                              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                              <XAxis dataKey="name" angle={-45} textAnchor="end" tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} height={60} />
                              <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11, fill: "#525252" }} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{ fill: "#f4f4f4" }} formatter={(val) => [formatNumber(val), "tCO2e"]} contentStyle={{ borderRadius: '4px', fontSize: "13px" }} />
                              <Bar dataKey="value" fill="#8a3ffc" barSize={40} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="col-span-7 bg-white border border-[#e0e0e0] flex flex-col">
                        <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center">
                          <h3 className="text-[16px] font-medium text-[#161616]">Highest Emitter Tables</h3>
                          <button onClick={() => setPortfolioAssets([])} className="text-[#da1e28] text-[13px] font-medium flex items-center gap-1 hover:underline">
                            <Trash2 size={14} /> Clear Portfolio
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[310px]">
                           <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0 font-medium whitespace-nowrap">
                              <tr>
                                <th className="px-4 py-3">Counterparty</th>
                                <th className="px-4 py-3">Sector</th>
                                <th className="px-4 py-3">Asset Class</th>
                                <th className="px-4 py-3 text-right">Exposure ($M)</th>
                                <th className="px-4 py-3 text-right">Emissions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...portfolioResults].sort((a, b) => b.financedEmissions - a.financedEmissions).slice(0, 10).map((p, i) => (
                                <tr key={p.id} className={`border-b border-[#e0e0e0] hover:bg-[#f9f9f9] ${i < 3 ? 'bg-[#fffcf8]' : ''}`}>
                                  <td className="px-4 py-3 font-medium text-[#161616] flex items-center gap-2">
                                     {i < 3 && <span className="text-[#ff832b]">?</span>}
                                     {p.counterparty}
                                  </td>
                                  <td className="px-4 py-3 text-[#525252] truncate max-w-[120px]" title={p.sector}>{p.sector}</td>
                                  <td className="px-4 py-3 text-[#525252]">{p.assetClass}</td>
                                  <td className="px-4 py-3 text-right font-mono">{formatNumber(p.exposure)}</td>
                                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#da1e28]">{formatNumber(p.financedEmissions)}</td>
                                </tr>
                              ))}
                            </tbody>
                           </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[#e0e0e0] p-16 flex flex-col items-center justify-center text-center mb-6">
                    <Database className="w-12 h-12 text-[#cccccc] mb-4" />
                    <h3 className="text-[18px] font-medium text-[#161616] mb-2">
                      Awaiting Calculation Data
                    </h3>
                    <p className="text-[14px] text-[#525252] max-w-md">
                      Navigate back to the data integration view to upload the necessary counterparty inputs and calculate financed emissions.
                    </p>
                    <button
                        onClick={() => setStep(2)}
                        className="mt-6 px-6 py-2.5 bg-[#161616] text-white hover:bg-[#393939] text-[14px] font-medium transition-colors rounded-sm"
                      >
                        Go to Data Integration
                      </button>
                  </div>
                )}
              </div>
            )}
`;

const patched = txt.substring(0, sIdx) + replacement + txt.substring(actualEIdx);
fs.writeFileSync('src/features/sustainability/pages/EmissionsModule.tsx', patched);
console.log('PATCH_SUCCESS_FINAL');
