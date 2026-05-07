import DashboardNavbar from "@/components/layout/DashboardNavbar/DashboardNavbar";
import { FileText, Download, Calendar, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const recentReports = [
  {
    title: "Q4 2025 Climate Risk Assessment",
    date: "Jan 15, 2026",
    type: "Quarterly",
    status: "Finalized",
  },
  {
    title: "Portfolio Segmentation Analysis",
    date: "Dec 20, 2025",
    type: "Ad-hoc",
    status: "Draft",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 pt-[70px]">
      <DashboardNavbar />
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Reporting Center
            </h1>
            <p className="text-slate-500 mt-1">
              Generate and manage regulatory and internal reports
            </p>
          </div>
          <button
            onClick={() => navigate("/cra/reporting")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] hover:bg-[#75a61e] text-white font-bold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <FileText size={18} />
            Create New Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Recent Reports
              </h2>
              <div className="flex flex-col gap-4">
                {recentReports.map((report, index) => (
                  <div key={index}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-[#86bc25]/30 transition-colors group">
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="p-3 bg-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                          <FileText
                            size={24}
                            className="text-slate-400 group-hover:text-[#86bc25]"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {report.date}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-white border-slate-200 text-slate-500">
                              {report.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold rounded-lg text-sm transition-colors w-full sm:w-auto justify-center">
                        <Download size={16} className="text-slate-400" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-[#86bc25]/50 text-slate-700 font-semibold rounded-xl text-sm transition-colors group">
                  <Calendar size={18} className="text-slate-400 group-hover:text-[#86bc25]" />
                  Schedule Report
                </button>
                <button className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-[#86bc25]/50 text-slate-700 font-semibold rounded-xl text-sm transition-colors group">
                  <Filter size={18} className="text-slate-400 group-hover:text-[#86bc25]" />
                  Manage Templates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
