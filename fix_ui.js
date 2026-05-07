const fs = require('fs');
const file = 'src/features/sustainability/pages/EmissionsModule.tsx';
let txt = fs.readFileSync(file, 'utf8');

if (!txt.includes('Legend,')) {
    txt = txt.replace('Tooltip,\n} from "recharts";', 'Tooltip,\n  Legend,\n} from "recharts";');
}

const targetReplacement = \
{/* STEP 4: RESULTS DASHBOARD */}
            {step === 3 && (
              <div className="animate-in fade-in duration-200 w-full mb-20">
                <div className="mb-6">
                  <h2 className="text-[24px] font-normal text-[#161616] leading-tight">
                    Master KPI Dashboard
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-6">
                  {[
                    { label: "Scope 1 Index", value: s1Total },
                    { label: "Scope 2 Index", value: s2Total },
                    { label: "Financed Scope 3", value: financedTotal },
                    {
                      label: "Enterprise Net Output",
                      value: grandTotal,
                      highlight: true,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={\\\p-6 flex flex-col justify-between \\\\\\}
                    >
                      <p
                        className={\\\	ext-[12px] uppercase font-semibold mb-6 tracking-wide \\\\\\}
                      >
                        {stat.label}
                      </p>
                      <div>
                        <p
                          className={\\\	ext-[36px] font-light leading-none \\\\\\}
                        >
                          {formatNumber(stat.value)}
                        </p>
                        <p
                          className={\\\	ext-[12px] mt-1 \\\\\\}
                        >
                          tCO2e absolute
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Financed Emissions Breakdown */}
                  <div className="col-span-8 bg-white border border-[#e0e0e0] p-6 h-[400px]">
                    <h3 className="text-[16px] font-medium text-[#161616] mb-8">
                      Financed Emissions by Sector
                    </h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(
                            portfolioResults.reduce((acc, curr) => {
                              acc[curr.sector] = (acc[curr.sector] || 0) + curr.financedEmissions;
                              return acc;
                            }, {})
                          ).map(([name, value]) => ({ name: name.slice(0, 15)+'...', value })).sort((a,b) => (b.value as number) - (a.value as number)).slice(0, 5)}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#525252" }} />
                          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#525252" }} width={120} />
                          <Tooltip
                            cursor={{ fill: "#f4f4f4" }}
                            contentStyle={{ borderRadius: 0, border: "1px solid #161616", padding: "12px", background: "#161616", color: "#f4f4f4", fontSize: "12px" }}
                            formatter={(value) => formatNumber(value as number)}
                          />
                          <Bar dataKey="value" fill="#86bc25" radius={0} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* DQS Overview Pie Chart */}
                  <div className="col-span-4 bg-white border border-[#e0e0e0] p-6 h-[400px]">
                    <h3 className="text-[16px] font-medium text-[#161616] mb-2">DQS Overview</h3>
                    <p className="text-[12px] text-[#525252] mb-4">Data Quality Score distribution across portfolio.</p>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={Object.entries(
                              portfolioResults.reduce((acc, curr) => {
                                acc[\\\DQS \\\\\\] = (acc[\\\DQS \\\\\\] || 0) + 1;
                                return acc;
                              }, {})
                            ).map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {Object.keys(portfolioResults.reduce((acc, curr) => { acc[\\\DQS \\\\\\] = 1; return acc; }, {})).map((entry, index) => (
                              <Cell key={\\\cell-\\\\\\} fill={['#86bc25', '#0f62fe', '#da1e28', '#f1c21b', '#8a3ffc', '#000000'][index % 6]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #161616", padding: "12px", background: "#161616", color: "#f4f4f4", fontSize: "12px" }} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Highest Emitter Tables */}
                  <div className="col-span-1 bg-white border border-[#e0e0e0] p-0">
                     <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
                        <h3 className="text-[16px] font-medium text-[#161616]">Highest Emitting Counterparties</h3>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                          <thead className="bg-white text-[#525252] font-medium border-b border-[#e0e0e0]">
                            <tr>
                              <th className="px-4 py-3">Counterparty</th>
                              <th className="px-4 py-3 text-right">Exposure ()</th>
                              <th className="px-4 py-3 text-right">Financed (tCO2e)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...portfolioResults].sort((a,b) => b.financedEmissions - a.financedEmissions).slice(0, 5).map((p, i) => (
                               <tr key={i} className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]">
                                  <td className="px-4 py-3 font-medium text-[#161616]">{p.counterparty}</td>
                                  <td className="px-4 py-3 text-right font-mono">{formatNumber(p.exposure)}</td>
                                  <td className="px-4 py-3 text-right font-mono">{formatNumber(p.financedEmissions)}</td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Summary / Intensity Metrics */}
                  <div className="col-span-1 bg-white border border-[#e0e0e0] p-6 flex flex-col justify-center">
                    <h3 className="text-[16px] font-medium text-[#161616] mb-6">Emission Intensity Metrics</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center p-4 bg-[#f4f4f4] border border-[#e0e0e0]">
                        <span className="text-[14px] text-[#525252]">Total Exposure ()</span>
                        <span className="text-[18px] font-light text-[#161616]">{formatNumber(portfolioResults.reduce((a,c) => a + c.exposure, 0))}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#f4f4f4] border border-[#e0e0e0]">
                        <span className="text-[14px] text-[#525252]">Portfolio Carbon Footprint (tCO2e / )</span>
                        <span className="text-[18px] font-light text-[#161616]">
                          {portfolioResults.reduce((a,c) => a + c.exposure, 0) > 0 ? formatNumber(financedTotal / portfolioResults.reduce((a,c) => a + c.exposure, 0)) : "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-[#f4f4f4] border border-[#e0e0e0]">
                        <span className="text-[14px] text-[#525252]">Weighted Average Carbon Intensity (tCO2e /  Revenue)</span>
                        <span className="text-[18px] font-light text-[#161616]">
                          {portfolioResults.reduce((a,c) => a + c.annualRevenue, 0) > 0 ? formatNumber(financedTotal / portfolioResults.reduce((a,c) => a + c.annualRevenue, 0)) : "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
\

const existingStep3Regex = /\{\/\*\s*STEP 4: RESULTS DASHBOARD\s*\*\/\}\s*\{\s*step === 3 && \([\s\S]*?(?=<div className="fixed bottom-0 right-0)/;

if(txt.match(existingStep3Regex)) {
   txt = txt.replace(existingStep3Regex, targetReplacement);
   fs.writeFileSync(file, txt);
   console.log("Replaced Dashboard UI");
}
