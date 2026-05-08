const fs = require('fs');

const original = fs.readFileSync('src/features/sustainability/pages/AIReport.tsx', 'utf8');

const tEndManager = original.indexOf('function ManagerReportView() {');
const tEndDataOwner = original.indexOf('function DataOwnerReportView() {');

// 1. Imports and constants
let topPart = original.substring(0, tEndDataOwner);
// Convert MUI imports
topPart = topPart.replace(/import \{[\s\S]*?\} from "@mui\/material";/, `import { useTheme } from "../../theme/hooks/useTheme";`);

// 2. DataOwner Hooks
const dataOwnerHooksEnd = original.indexOf('return (', tEndDataOwner);
const dataOwnerHooks = original.substring(tEndDataOwner, dataOwnerHooksEnd);

// 3. Manager Hooks
const managerHooksEnd = original.indexOf('return (', tEndManager);
const managerHooks = original.substring(tEndManager, managerHooksEnd);

// 4. Construct DataOwner UI
const dataOwnerUI = `return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 font-semibold text-sm flex items-center gap-2 hover:text-[#86bc25] transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#86bc25]/10 border-2 border-[#86bc25]/20 flex items-center justify-center">
              <ClipboardCheck size={24} className="text-[#86bc25]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">My Disclosure Assignments</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Welcome, {user?.name} - complete your assigned minimum disclosure responses below</p>
            </div>
          </div>
          <button onClick={() => setSaved(true)} className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] hover:bg-[#86bc25]/90 text-white rounded-xl font-bold shadow-lg shadow-[#86bc25]/20 transition-all">
            <Save size={16} /> Save Responses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#86bc25]" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Assigned</div>
          <div className="text-2xl font-black dark:text-white">{totalCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</div>
          <div className="text-2xl font-black text-emerald-500">{filledCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pending</div>
          <div className="text-2xl font-black text-amber-500">{totalCount - filledCount}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Progress</div>
          <div className="text-2xl font-black text-blue-500">{completionPct}%</div>
        </div>
      </div>

      <div className="space-y-4">
        {DISCLOSURE_PILLARS.map((pillar) => {
          const disclosures = pillarGroups[pillar] || [];
          if (disclosures.length === 0) return null;
          
          const Icon = PILLAR_ICONS[pillar] || FileText;
          const color = PILLAR_COLORS[pillar];
          const isExpanded = expandedPillar === pillar;

          return (
            <div key={pillar} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div 
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between border-b border-slate-200 dark:border-slate-700"
                onClick={() => setExpandedPillar(isExpanded ? null : pillar)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80 mix-blend-multiply dark:mix-blend-normal" style={{ backgroundColor: color + '20', color: color }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm dark:text-white">{pillar}</div>
                    <div className="text-xs text-slate-500">{PILLAR_REFS[pillar]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={12} className={disclosures.filter(d => disclosureResponses[d.id]?.trim()).length === disclosures.length ? "text-emerald-500" : ""} />
                    {disclosures.filter(d => disclosureResponses[d.id]?.trim()).length} / {disclosures.length}
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>
              
              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {disclosures.map((d) => (
                    <div key={d.id} className="p-4 pl-6 bg-slate-50/30 dark:bg-slate-800/30">
                      <div className="mb-2">
                        <div className="flex gap-2 items-start mb-1">
                          <div className={\`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 \${disclosureResponses[d.id] ? 'bg-emerald-500' : 'bg-amber-500'}\`} />
                          <div>
                            <div className="font-bold text-sm dark:text-slate-200">{d.requirement}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{d.description}</div>
                          </div>
                        </div>
                      </div>
                      <textarea
                        className="w-full pl-3 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-[#86bc25] focus:border-[#86bc25] outline-none transition-all resize-none dark:text-white"
                        rows={3}
                        placeholder="Provide the entity's response..."
                        value={disclosureResponses[d.id] || ""}
                        onChange={(e) => updateResponse(d.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {saved && (
        <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} /> Progress saved
        </div>
      )}
    </div>
  );
}`;

// 5. Construct Manager UI
const managerUI = `return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 font-semibold text-sm flex items-center gap-2 hover:text-[#86bc25] transition-colors w-fit">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText size={24} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold dark:text-white">AI Report Generation</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage, generate, and export IFRS S1/S2 compliant sustainability reports</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {!reportDraft ? (
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMainTab(0)}
              className={\`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors \${mainTab === 0 ? 'border-[#86bc25] text-[#86bc25] bg-[#86bc25]/5' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}\`}
            >
               Report Setup (Disclosures)
            </button>
            <button
              onClick={() => setMainTab(1)}
              className={\`flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors \${mainTab === 1 ? 'border-[#86bc25] text-[#86bc25] bg-[#86bc25]/5' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}\`}
            >
              Generate Report
            </button>
          </div>
        ) : null}

        {mainTab === 0 && !reportDraft && (
          <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
            {DISCLOSURE_PILLARS.map((pillar) => {
              const items = pillarDisclosures[pillar] || [];
              if (items.length === 0) return null;
              
              const Icon = PILLAR_ICONS[pillar] || FileText;
              const color = PILLAR_COLORS[pillar];
              const isExpanded = expandedSetupPillar === pillar;

              return (
                <div key={pillar} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-wrap items-center justify-between border-b gap-4 border-slate-200 dark:border-slate-700"
                    onClick={() => setExpandedSetupPillar(isExpanded ? null : pillar)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20', color: color }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm dark:text-white">{pillar}</div>
                        <div className="text-xs text-slate-500">{PILLAR_REFS[pillar]}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); setAssignmentSaved(true); }} className="text-xs font-semibold px-2 text-[#86bc25] hover:underline">
                        Save Setup
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {items.map((d) => {
                        const isFilled = !!disclosureResponses[d.id]?.trim();
                        const isAssigned = !!disclosureAssignments[d.id];
                        return (
                          <div key={d.id} className="p-4 sm:flex gap-4 items-start bg-slate-50/30 dark:bg-slate-800/30">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={\`w-1.5 h-1.5 rounded-full shrink-0 \${isFilled ? 'bg-emerald-500' : isAssigned ? 'bg-amber-500' : 'bg-slate-400'}\`} />
                                <div className="font-bold text-sm dark:text-slate-200">{d.requirement}</div>
                              </div>
                              <div className="text-xs text-slate-500 ml-3 mb-2">{d.description}</div>
                              
                              <textarea
                                className="w-full ml-3 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-[#86bc25] focus:border-[#86bc25] outline-none transition-all resize-none dark:text-white"
                                rows={2}
                                placeholder="Override/edit response directly..."
                                value={disclosureResponses[d.id] || ""}
                                onChange={(e) => updateDisclosureResponse(d.id, e.target.value)}
                              />
                            </div>
                            
                            <div className="mt-3 sm:mt-0 flex gap-2 items-center flex-wrap shrink-0">
                              <select
                                className="text-xs p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                                value={disclosureAssignments[d.id] || ""}
                                onChange={(e) => assignDisclosure(d.id, e.target.value)}
                              >
                                <option value="">Unassigned</option>
                                {dataOwnerUsers.map(u => <option key={u.email} value={u.name}>{u.name}</option>)}
                              </select>
                              <div className={\`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded \${isFilled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}\`}>
                                {isFilled ? <><CheckCircle2 size={10}/> Done</> : <><Clock size={10}/> Pending</>}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mainTab === 1 && !reportDraft && (
          <div className="p-4 md:p-8 text-center max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8 text-left">
              {[
                { label: "Disclosures", value: \`\${disclosureFilledCount} / \${MINIMUM_DISCLOSURES.length}\`, color: "emerald", ready: completionPct >= 50 },
                { label: "Assignments", value: \`\${disclosureAssignedCount} / \${MINIMUM_DISCLOSURES.length}\`, color: "[#86bc25]", ready: disclosureAssignedCount > 0 },
                { label: "Materiality", value: \`\${selectedMaterialTopicIds.length} topics\`, color: "indigo", ready: selectedMaterialTopicIds.length > 0 },
                { label: "Emissions", value: totalEmissions > 0 ? \`\${formatNumber(totalEmissions)} tCO2e\` : "None", color: "sky", ready: totalEmissions > 0 },
                { label: "Scenarios", value: \`\${scenarioResults.length} models\`, color: "amber", ready: scenarioResults.length > 0 },
                { label: "Templates", value: \`\${templates.length} deployed\`, color: "pink", ready: templates.length > 0 },
              ].map(item => (
                <div key={item.label} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center gap-3">
                  {item.ready ? <CheckCircle2 size={16} className={\`text-\${item.color}-500\`} /> : <AlertCircle size={16} className="text-slate-400" />}
                  <div>
                    <div className="uppercase tracking-wider text-[10px] font-bold text-slate-500">{item.label}</div>
                    <div className={\`text-sm font-bold \${item.ready ? 'text-' + item.color + '-600 dark:text-' + item.color + '-400' : 'text-slate-400'}\`}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-md mx-auto py-4">
              <div className="w-16 h-16 bg-[#86bc25]/10 border-2 border-[#86bc25]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-[#86bc25]" />
              </div>
              <h2 className="text-2xl font-black mb-2 dark:text-white">Run AI Engine</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Compile entity data, risk assessments, emissions, scenario results, and disclosure responses into a cohesive IFRS S1/S2 report.</p>
              
              <div className="mb-6 max-w-xs mx-auto text-left">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Reporting Year</label>
                <select 
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm outline-none dark:text-white"
                  value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {REPORT_YEAR_OPTIONS.map(y => <option key={y} value={y}>FY {y}</option>)}
                </select>
              </div>

              {!canGenerate && <p className="text-sm text-amber-500 font-semibold mb-4">Only Managers/Admins can generate reports.</p>}
              
              {generating && (
                <div className="mb-6 text-left">
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-[#86bc25] transition-all duration-300" style={{ width: progress + '%' }} />
                  </div>
                  <div className="text-xs text-slate-500 grid-cols-1">
                    {progress < 25 ? "Compiling entity..." : progress < 50 ? "Analyzing risks..." : progress < 75 ? "Calculating emissions..." : "Generating narrative..."}
                  </div>
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={generating || !canGenerate}
                className="w-full sm:w-auto px-8 py-3 bg-[#86bc25] hover:bg-[#86bc25]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto shadow-xl shadow-[#86bc25]/20 transition-all"
              >
                {generating ? <Zap size={18} className="animate-pulse" /> : <Sparkles size={18} />}
                {generating ? "Generating..." : "Generate AI Report"}
              </button>
            </div>
          </div>
        )}

        {reportDraft && (
          <div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => { setReportDraft(""); setMainTab(0); }} className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5">
                  <RotateCcw size={14} /> Back
                </button>
                <div className="font-bold text-sm dark:text-white">Generated Report &mdash; {entityProfile.name}</div>
                {reportGeneratedBy && (
                  <div className="px-2 py-1 bg-[#86bc25]/10 text-[#86bc25] rounded text-[10px] font-bold flex items-center gap-1">
                    <User size={10} /> {reportGeneratedBy} &bull; FY {reportYear}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={generateReport} disabled={generating || !canGenerate} className="px-3 py-1.5 bg-[#86bc25] hover:bg-[#86bc25]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Sparkles size={14} /> Regenerate
                </button>
                <button onClick={() => imageInputRef.current?.click()} className="px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 flex items-center gap-1.5">
                  <ImagePlus size={14} /> Image
                </button>
                <button onClick={() => {
                  const doc = new jsPDF({ unit: "pt", format: "a4" });
                  const pageWidth = doc.internal.pageSize.getWidth();
                  const pageHeight = doc.internal.pageSize.getHeight();
                  const margin = 50;
                  const maxLineWidth = pageWidth - margin * 2;
                  let y = margin;
                  const renderBlock = (text, fontSize, bold) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(fontSize); const lineH = fontSize * 1.45; const lines = doc.splitTextToSize(text, maxLineWidth); lines.forEach((line) => { if (y + lineH > pageHeight - margin) { doc.addPage(); y = margin; } doc.text(line, margin, y); y += lineH; }); y += fontSize * 0.35; };
                  reportDraft.split("\\n").forEach((line) => { if (line.startsWith("# ")) { renderBlock(line.replace(/^#\\s+/, ""), 16, true); } else if (line.startsWith("## ")) { renderBlock(line.replace(/^##\\s+/, ""), 13, true); } else if (line.startsWith("### ")) { renderBlock(line.replace(/^###\\s+/, ""), 11, true); } else if (line.trim() === "") { y += 8; } else { renderBlock(line, 10, false); } });
                  reportImages.forEach((img) => { doc.addPage(); doc.addImage(img.dataUrl, margin, margin, maxLineWidth, 0); });
                  doc.save(entityProfile.name.replace(/\\s+/g, "_") + "_Sustainability_Report_" + new Date().getFullYear() + ".pdf");
                }} className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 flex items-center gap-1.5">
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>

            <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleImageUpload} />

            <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
              <textarea
                className="w-full p-4 font-serif text-sm leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86bc25] dark:text-slate-100 min-h-[600px] resize-y"
                value={reportDraft}
                onChange={(e) => setReportDraft(e.target.value)}
              />

              {reportImages.length > 0 && (
                <div className="mt-6">
                  <div className="font-bold text-sm mb-3 dark:text-white">Attached Images</div>
                  <div className="flex flex-wrap gap-4">
                    {reportImages.map(img => (
                      <div key={img.id} className="relative w-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-red-600">
                          <X size={12} />
                        </button>
                        <img src={img.dataUrl} alt={img.name} className="w-full h-24 object-cover" />
                        <div className="p-1 px-2 text-[10px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap bg-white dark:bg-slate-800">{img.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {assignmentSaved && (
        <div className="fixed bottom-4 right-4 bg-[#86bc25] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={16} /> Progress saved
        </div>
      )}
    </div>
  );
}
`;

// Merge pieces together
const finalFile = topPart + dataOwnerHooks + dataOwnerUI + managerHooks + managerUI;

fs.writeFileSync('src/features/sustainability/pages/AIReport.tsx', finalFile);
console.log('AIReport.tsx successfully rewritten!');
