import { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Layers, 
  Lock
} from "lucide-react";

import CRANavigation from "../components/CRANavigation";
import CRALayout from "../layout/CRALayout";
import { REPORT_PHASES } from "../data/constants";
import { formatExposureM } from "../utils/craUtils";
import {
  useCRAStatusStore,
  useCRADataStore
} from "@/store/craStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useIndustry } from "@/hooks/useIndustry";
import { getAssetExposure } from "@/lib/utils";

export default function CRAReporting() {
  const statusStore = useCRAStatusStore();
  const { assets } = useCRADataStore();
  const { config: industryConfig } = useIndustry();
  const [activeStep, setActiveStep] = useState(0);

  const [metadata, setMetadata] = useState({
    title: industryConfig.id === "telecommunications"
        ? "Telecommunications Climate Risk Assessment Report"
        : "Quarterly Climate Risk Assessment Report",
    date: new Date().toISOString().split("T")[0],
    horizon: "Medium Term (3-10y)",
    frameworks: {
      basel: true,
      ngfs: false,
      ifrsS2: true,
      internal: true,
    },
  });

  const [sections, setSections] = useState([
    { id: "exec_summary", title: "1. Executive Summary", included: true },
    { id: "portfolio", title: industryConfig.id === "telecommunications" ? "2. Infrastructure Asset Overview" : "2. Portfolio Overview", included: true },
    { id: "physical_risk", title: "3. Physical Risk Assessment", included: true },
    { id: "transition_risk", title: "4. Transition Risk Assessment", included: true },
    { id: "collateral", title: "5. Collateral Sensitivity & Vulnerability", included: true },
    { id: "risk_concentration", title: "6. Risk Concentrations & Hotspots", included: true },
    { id: "methodology", title: "7. Methodology & Assumptions", included: true },
    { id: "appendices", title: "8. Appendices & Data Tables", included: true },
  ]);

  const [execSummaryText, setExecSummaryText] = useState(
    industryConfig.id === "telecommunications"
      ? "This report presents the findings of the Climate Risk Assessment (CRA) conducted on the telecommunications infrastructure asset base.\nKey highlights:\n- Physical risk exposure is concentrated in tower infrastructure across flood-prone and coastal zones.\n- Transition risk is driven by energy efficiency mandates and carbon tax implications on diesel-dependent power systems.\n- Infrastructure asset values in high-risk geopolitical zones have been adjusted to reflect potential climate-related depreciation."
      : "This report presents the findings of the Climate Risk Assessment (CRA) conducted on the portfolio.\nKey highlights:\n- Physical risk exposure is concentrated in coastal regions.\n- Transition risk is driven by potential carbon tax implementations in the Manufacturing sector.\n- Collateral values in high-risk zones have been adjusted to reflect potential market devaluation."
  );

  const allAssets = useMemo(() => Object.values(assets).flatMap((a) => a.data || []), [assets]);
  const totalExposure = useMemo(() => allAssets.reduce((sum, a) => sum + getAssetExposure(a), 0), [allAssets]);
  
  const sectorDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    allAssets.forEach((a) => {
      const s = a.sector || "Unclassified";
      dist[s] = (dist[s] || 0) + getAssetExposure(a);
    });
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allAssets]);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  const generatePDF = async () => {
    setIsGenerating(true);
    // Remove toast to avoid TS errors
    try {
      const element = document.getElementById("cra-report-print-content");
      if (!element) return;
      element.style.opacity = "1";
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      element.style.opacity = "0";

      const pdf = new jsPDF("p", "pt", "a4");
      const imgWidth = 595.28;
      const pageHeight = 841.89;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save("CRA_Report.pdf");
      alert("Success! Your report has been downloaded.");
    } catch (error) {
      console.error(error);
      alert("Error: Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const modulesStatus = [
    { name: "Portfolio Data", status: statusStore.dataUploaded },
    { name: "Segmentation", status: statusStore.segmentationReady },
    { name: "Physical Risk Assessment", status: statusStore.praReady },
    { name: "Transition Risk Assessment", status: statusStore.traReady },
  ];
  const allReady = modulesStatus.every((m) => m.status);

  const renderReadinessCheck = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Readiness</h2>
      <p className="text-slate-500 mb-6">Review the completion status of requisite modules before generating the final report.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {modulesStatus.map((mod, i) => (
          <div key={i} className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className={`p-2 rounded-lg text-white ${mod.status ? 'bg-[#86bc25]' : 'bg-slate-300'}`}>
              {mod.status ? <CheckCircle2 size={24} /> : <Lock size={24} />}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{mod.name}</h4>
              <p className="text-xs text-slate-500">{mod.status ? "Assessment Complete" : "Pending Completion"}</p>
            </div>
          </div>
        ))}
      </div>
      {!allReady && (
        <div className="p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg mb-6 flex items-center gap-3">
          <Shield size={20} className="text-amber-500" />
          <p className="text-sm font-medium">Some modules are incomplete. You can proceed, but the report will have data gaps.</p>
        </div>
      )}
      <div className="flex justify-end">
        <button onClick={handleNext} className="flex items-center gap-2 bg-[#86bc25] hover:bg-[#75a61e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
          Proceed to Setup
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderReportSetup = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Configuration</h2>
      <p className="text-slate-500 mb-6">Define the scope, horizon, and regulatory frameworks for this report.</p>
      
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Report Title</label>
              <input type="text" className="w-full border rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-[#86bc25]" value={metadata.title} onChange={(e) => setMetadata({...metadata, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Report Date</label>
              <input type="date" className="w-full border rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-[#86bc25]" value={metadata.date} onChange={(e) => setMetadata({...metadata, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Reporting Horizon</label>
              <select className="w-full border rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-[#86bc25]" value={metadata.horizon} onChange={(e) => setMetadata({...metadata, horizon: e.target.value})}>
                <option>Short Term (1-3y)</option>
                <option>Medium Term (3-10y)</option>
                <option>Long Term &gt;10y</option>
              </select>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Framework Alignment</h4>
            <div className="flex flex-col gap-3">
              {Object.entries(metadata.frameworks).map(([key, val]) => (
                <label key={key} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 cursor-pointer hover:border-[#86bc25]/50 transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-[#86bc25] accent-[#86bc25]" checked={val} onChange={(e) => setMetadata({...metadata, frameworks: {...metadata.frameworks, [key]: e.target.checked}})} />
                  <span className="text-sm font-medium text-slate-700">{key.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={handleBack} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Back</button>
        <button onClick={handleNext} className="flex items-center gap-2 bg-[#86bc25] hover:bg-[#75a61e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
          Compile Content
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderAssembly = () => (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Content Assembly</h2>
      <p className="text-slate-500 mb-6">Select report sections and customize the executive summary.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 bg-white border rounded-xl p-5">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18} className="text-[#86bc25]" /> Sections</h4>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {sections.map((sec, i) => (
              <label key={sec.id} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-transparent">
                <input 
                  type="checkbox" 
                  checked={sec.included}
                  onChange={(e) => {
                    const newSecs = [...sections];
                    newSecs[i].included = e.target.checked;
                    setSections(newSecs);
                  }}
                  className="w-4 h-4 text-[#86bc25] accent-[#86bc25]"
                />
                <span className="text-sm text-slate-700 font-medium">{sec.title}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white border rounded-xl p-5 flex flex-col">
          <h4 className="font-semibold text-slate-800 mb-4">Executive Summary Draft</h4>
          <textarea 
            className="w-full flex-grow p-4 min-h-[300px] border rounded-lg bg-slate-50 focus:outline-[#86bc25] text-sm text-slate-700 font-medium resize-none leading-relaxed"
            value={execSummaryText}
            onChange={(e) => setExecSummaryText(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-between">
        <button onClick={handleBack} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Back</button>
        <button onClick={handleNext} className="flex items-center gap-2 bg-[#86bc25] hover:bg-[#75a61e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
          Review & Finalize
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderFinalize = () => (
    <div>
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-[#86bc25]/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-[#86bc25]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Report Ready for Generation</h2>
        <p className="text-slate-500">Your custom reporting package has been accurately assembled.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4 hover:border-[#86bc25]/30 hover:shadow-sm transition-all cursor-pointer" onClick={generatePDF}>
          <div className="bg-white p-4 rounded-full shadow-sm">
            <Download size={28} className="text-slate-700" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-800">Download Interactive PDF</h4>
            <p className="text-xs text-slate-500 mt-1">High resolution, optimized for reading</p>
          </div>
          <button 
            disabled={isGenerating}
            className="mt-2 text-sm font-bold bg-[#86bc25] hover:bg-[#75a61e] text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Download"}
          </button>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-4 hover:border-[#86bc25]/30 hover:shadow-sm transition-all cursor-pointer">
          <div className="bg-white p-4 rounded-full shadow-sm">
            <FileText size={28} className="text-slate-700" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-slate-800">Export Data Tables</h4>
            <p className="text-xs text-slate-500 mt-1">Raw CSV export of all schedules</p>
          </div>
          <button className="mt-2 text-sm font-bold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-lg transition-colors">
            Export CSV
          </button>
        </div>
      </div>
      
      <div className="flex justify-between max-w-4xl mx-auto border-t pt-6">
        <button onClick={handleBack} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors">Back</button>
      </div>
    </div>
  );

  const renderPrintReport = () => (
    <div className="w-[1100px] p-12 bg-white text-slate-800" style={{ fontFamily: "Arial, sans-serif" }}>
      <div className="border-b-[4px] border-[#86bc25] pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{metadata.title}</h1>
          <p className="text-xl text-slate-500">Global Consolidated Bank</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Date of Issue</p>
          <p className="text-lg text-slate-800 font-medium">{metadata.date}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="col-span-2 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">Executive Summary</h3>
          <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{execSummaryText}</p>
        </div>
        <div className="bg-[#86bc25]/10 p-6 rounded-lg border border-[#86bc25]/20">
          <h3 className="text-lg font-bold mb-4 text-slate-900">Key Metrics</h3>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Exposure</p>
              <p className="text-2xl font-black text-[#86bc25]">{industryConfig.id === "telecommunications" ? "$ " : "? "}{formatExposureM(totalExposure)}M</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Reporting Horizon</p>
              <p className="text-lg font-bold text-slate-800">{metadata.horizon}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-10 page-break-after">
        <h3 className="text-2xl font-bold mb-6 pb-2 border-b-2 border-slate-200">Sector Distribution</h3>
        <div className="bg-slate-50 p-6 rounded-lg border h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorDistribution} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(val) => `${val}M`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{fill: '#f1f5f9'}} formatter={(val) => [`${val}M`, "Exposure"]} />
              <Bar dataKey="value" fill="#86bc25" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <CRALayout>
      <div className="flex justify-center mb-8 pt-8">
        <div className="flex items-center gap-2 max-w-4xl w-full justify-between px-10">
          {REPORT_PHASES.map((label, idx) => (
            <div key={label} className="flex flex-col items-center gap-2 relative z-10 w-1/4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                activeStep > idx ? 'bg-[#86bc25] border-[#86bc25] text-white' : 
                activeStep === idx ? 'bg-white border-[#86bc25] text-[#86bc25]' : 
                'bg-slate-100 border-slate-300 text-slate-400'
              } transition-colors`}>
                {idx + 1}
              </div>
              <span className={`text-xs font-semibold ${activeStep >= idx ? 'text-slate-800' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10" />
          <div className="absolute top-5 left-[15%] h-0.5 bg-[#86bc25] -z-10 transition-all" style={{ width: `${(activeStep / (REPORT_PHASES.length - 1)) * 70}%` }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto min-h-[500px]">
        <div className="bg-white p-8 rounded-2xl border shadow-sm">
          {activeStep === 0 && renderReadinessCheck()}
          {activeStep === 1 && renderReportSetup()}
          {activeStep === 2 && renderAssembly()}
          {activeStep === 3 && renderFinalize()}
        </div>
      </div>

      <div id="cra-report-print-content" className="fixed left-[-9999px] top-0 opacity-0 pointer-events-none">
        {renderPrintReport()}
      </div>

      <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur-md border-t p-4 mt-8">
        <CRANavigation compact prevPath="/cra/collateral" prevLabel="Back: Collateral" />
      </div>
    </CRALayout>
  );
}
