import { useMemo, useState } from "react";
import {
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  ExternalLink,
  Sparkles,
  Building2,
  Globe,
  Shield,
  ArrowUpRight,
} from "lucide-react";
import { useRegionStore, type RegionProfile } from "@/store/regionStore";

const BRAND_GREEN = "#86bc25";

type ReportStatus = "Filed" | "Draft" | "Overdue" | "Upcoming";

interface ReportItem {
  id: string;
  title: string;
  framework: "IFRS S1/S2" | "TCFD" | "GRI" | "CBN ESRM" | "SEC NGN" | "NDC NDA";
  authority: string;
  period: string;
  dueDate: string;
  status: ReportStatus;
  pages: number;
  size: string;
  lastUpdated: string;
  preparer: string;
}

const getFrameworks = (r: RegionProfile) => [
  {
    id: "IFRS S1/S2",
    name: "IFRS S1/S2",
    body: "ISSB · International Sustainability Standards Board",
    color: "#3B82F6",
    icon: Globe,
    count: 4,
  },
  {
    id: "TCFD",
    name: "TCFD",
    body: "Task Force on Climate-related Financial Disclosures",
    color: "#10B981",
    icon: Shield,
    count: 3,
  },
  {
    id: "CBN ESRM",
    name: r.centralBankShort + " ESRM",
    body: r.centralBank + " · ESRM Guidelines",
    color: BRAND_GREEN,
    icon: Building2,
    count: 5,
  },
  {
    id: "SEC NGN",
    name: "SEC " + r.code,
    body: "Securities & Exchange Commission " + r.country,
    color: "#8B5CF6",
    icon: FileText,
    count: 2,
  },
  {
    id: "GRI",
    name: "GRI",
    body: "Global Reporting Initiative",
    color: "#F59E0B",
    icon: Globe,
    count: 3,
  },
  {
    id: "NDC NDA",
    name: "NDC NDA",
    body: "National Designated Authority (" + r.country + ")",
    color: "#EF4444",
    icon: Sparkles,
    count: 2,
  },
];

const getReports = (r: RegionProfile): ReportItem[] => [
  {
    id: "r1",
    title: "Annual Sustainability Report 2025",
    framework: "IFRS S1/S2",
    authority: "ISSB",
    period: "FY 2025",
    dueDate: "2026-04-30",
    status: "Filed",
    pages: 184,
    size: "4.2 MB",
    lastUpdated: "2026-04-22",
    preparer: "Sustainability Office",
  },
  {
    id: "r2",
    title: "Climate-Related Financial Disclosures",
    framework: "TCFD",
    authority: "TCFD Secretariat",
    period: "FY 2025",
    dueDate: "2026-05-15",
    status: "Filed",
    pages: 76,
    size: "2.8 MB",
    lastUpdated: "2026-04-18",
    preparer: "Risk & Sustainability",
  },
  {
    id: "r3",
    title: "ESRM Quarterly Compliance Filing",
    framework: "CBN ESRM",
    authority: r.centralBank,
    period: "Q1 2026",
    dueDate: "2026-05-30",
    status: "Draft",
    pages: 42,
    size: "1.1 MB",
    lastUpdated: "2026-05-02",
    preparer: "Compliance Division",
  },
  {
    id: "r4",
    title: "Green Bond Annual Impact Report",
    framework: "IFRS S1/S2",
    authority: "ISSB / IFC",
    period: "FY 2025",
    dueDate: "2026-06-15",
    status: "Draft",
    pages: 58,
    size: "1.6 MB",
    lastUpdated: "2026-04-30",
    preparer: "Treasury & Sustainability",
  },
  {
    id: "r5",
    title: "GRI Universal Standards Disclosure",
    framework: "GRI",
    authority: "GRI Secretariat",
    period: "FY 2025",
    dueDate: "2026-06-30",
    status: "Upcoming",
    pages: 0,
    size: "—",
    lastUpdated: "2026-03-15",
    preparer: "Sustainability Office",
  },
  {
    id: "r6",
    title: "SEC NGN ESG Disclosure (Listed Issuer)",
    framework: "SEC NGN",
    authority: "SEC " + r.country,
    period: "FY 2025",
    dueDate: "2026-04-30",
    status: "Filed",
    pages: 32,
    size: "0.9 MB",
    lastUpdated: "2026-04-25",
    preparer: "Investor Relations",
  },
  {
    id: "r7",
    title: "CBN ESRM Annual Statement",
    framework: "CBN ESRM",
    authority: r.centralBank,
    period: "FY 2025",
    dueDate: "2026-03-31",
    status: "Filed",
    pages: 96,
    size: "2.4 MB",
    lastUpdated: "2026-03-28",
    preparer: "Compliance Division",
  },
  {
    id: "r8",
    title: "NDC Implementation Progress Report",
    framework: "NDC NDA",
    authority: "Federal Ministry of Environment",
    period: "H2 2025",
    dueDate: "2026-04-15",
    status: "Overdue",
    pages: 0,
    size: "—",
    lastUpdated: "2026-02-20",
    preparer: "Sustainability Office",
  },
  {
    id: "r9",
    title: "Climate Scenario Analysis Disclosure",
    framework: "TCFD",
    authority: "TCFD Secretariat",
    period: "FY 2025",
    dueDate: "2026-07-31",
    status: "Upcoming",
    pages: 0,
    size: "—",
    lastUpdated: "—",
    preparer: "Risk Office",
  },
  {
    id: "r10",
    title: "Modern Slavery & Human Rights Statement",
    framework: "GRI",
    authority: "GRI Secretariat",
    period: "FY 2025",
    dueDate: "2026-06-30",
    status: "Draft",
    pages: 18,
    size: "0.4 MB",
    lastUpdated: "2026-04-12",
    preparer: "Legal & HR",
  },
];

const statusStyle: Record<
  ReportStatus,
  { bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  Filed: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  Draft: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-700 dark:text-amber-300",
    icon: Clock,
  },
  Overdue: {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    icon: AlertTriangle,
  },
  Upcoming: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    icon: Calendar,
  },
};

const daysUntil = (dueDate: string) => {
  const diff = (new Date(dueDate).getTime() - Date.now()) / 86400000;
  return Math.ceil(diff);
};

export default function SDGReports() {
  const region = useRegionStore((s) => s.profile);
  const FRAMEWORKS = useMemo(() => getFrameworks(region), [region]);
  const REPORTS = useMemo(() => getReports(region), [region]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReportStatus>("all");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return REPORTS.filter((r) => {
      if (
        search &&
        !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.authority.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (frameworkFilter !== "all" && r.framework !== frameworkFilter)
        return false;
      return true;
    });
  }, [search, statusFilter, frameworkFilter, REPORTS]);

  const counts = useMemo(() => {
    return {
      filed: REPORTS.filter((r) => r.status === "Filed").length,
      draft: REPORTS.filter((r) => r.status === "Draft").length,
      overdue: REPORTS.filter((r) => r.status === "Overdue").length,
      upcoming: REPORTS.filter((r) => r.status === "Upcoming").length,
    };
  }, [REPORTS]);

  const upcoming = useMemo(
    () =>
      [...REPORTS]
        .filter((r) => r.status !== "Filed")
        .sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        )
        .slice(0, 4),
    [REPORTS],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-[#86bc25] uppercase mb-3">
                Regulatory Disclosures · Reporting Calendar
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                Reports &amp; <span className="text-[#86bc25]">Disclosure</span>{" "}
                Centre
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                Centralised tracking of every sustainability and climate
                disclosure across IFRS S1/S2, TCFD, GRI, CBN ESRM and NDC NDA
                frameworks.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 border border-[#86bc25] text-[#86bc25] text-xs font-bold uppercase tracking-wider hover:bg-[#86bc25]/5 transition-colors">
                Reporting Calendar
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#75a620] transition-colors">
                <FileText size={14} /> New Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 mt-8 border border-gray-200 dark:border-gray-800">
            {[
              {
                label: "Filed",
                value: counts.filed,
                sub: "Submitted to authorities",
                accent: "#10B981",
              },
              {
                label: "In Draft",
                value: counts.draft,
                sub: "Awaiting finalisation",
                accent: "#F59E0B",
              },
              {
                label: "Overdue",
                value: counts.overdue,
                sub: "Immediate action required",
                accent: "#EF4444",
              },
              {
                label: "Upcoming",
                value: counts.upcoming,
                sub: "Within next 90 days",
                accent: "#3B82F6",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-900 px-5 py-4"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-10" style={{ background: s.accent }} />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {s.label}
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-[10px] text-gray-500">{s.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Frameworks */}
        <section>
          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#86bc25] font-bold mb-1">
              Reporting Frameworks
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Active Standards
            </h2>
            <div className="h-px bg-gradient-to-r from-[#86bc25] via-gray-200 dark:via-gray-700 to-transparent mt-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {FRAMEWORKS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.id}
                  onClick={() =>
                    setFrameworkFilter(frameworkFilter === f.id ? "all" : f.id)
                  }
                  className={`bg-white dark:bg-gray-900 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group relative ${
                    frameworkFilter === f.id
                      ? "ring-2 ring-inset ring-[#86bc25]"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ background: `${f.color}20` }}
                    >
                      <Icon size={18} style={{ color: f.color }} />
                    </div>
                    <span
                      className="text-[10px] font-bold tabular-nums"
                      style={{ color: f.color }}
                    >
                      {f.count} reports
                    </span>
                  </div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">
                    {f.name}
                  </div>
                  <div className="text-[10px] text-gray-500 leading-snug mt-1 line-clamp-2">
                    {f.body}
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="absolute bottom-3 right-3 text-gray-300 group-hover:text-[#86bc25] transition-colors"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Upcoming deadlines + filter rail */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming deadlines */}
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#86bc25] font-bold">
                  Next 4 Deadlines
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Upcoming &amp; Pending
                </h3>
              </div>
              <Calendar size={16} className="text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcoming.map((r) => {
                const days = daysUntil(r.dueDate);
                const isOverdue = days < 0;
                const isUrgent = days >= 0 && days <= 14;
                return (
                  <div
                    key={r.id}
                    className="border-l-4 pl-3 py-1"
                    style={{
                      borderColor: isOverdue
                        ? "#EF4444"
                        : isUrgent
                          ? "#F59E0B"
                          : BRAND_GREEN,
                    }}
                  >
                    <div className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">
                      {r.title}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {r.authority} · {r.framework}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] tabular-nums text-gray-700 dark:text-gray-300">
                        {new Date(r.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        className="text-[10px] font-bold tabular-nums"
                        style={{
                          color: isOverdue
                            ? "#EF4444"
                            : isUrgent
                              ? "#F59E0B"
                              : BRAND_GREEN,
                        }}
                      >
                        {isOverdue
                          ? `${Math.abs(days)}d overdue`
                          : `${days}d remaining`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports list */}
          <div className="lg:col-span-8">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or authority..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#86bc25]"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-gray-400" />
                {(
                  ["all", "Filed", "Draft", "Overdue", "Upcoming"] as const
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      statusFilter === s
                        ? "bg-[#86bc25] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Report
                      </th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Framework
                      </th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Period
                      </th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Due
                      </th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-gray-500 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => {
                      const ss = statusStyle[r.status];
                      const SIcon = ss.icon;
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <FileText
                                size={14}
                                className="text-[#86bc25] mt-0.5 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-bold text-gray-900 dark:text-white">
                                  {r.title}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                  {r.authority} · {r.preparer}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                              {r.framework}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                            {r.period}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-gray-700 dark:text-gray-300">
                            {new Date(r.dueDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ss.bg} ${ss.text}`}
                            >
                              <SIcon size={10} /> {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {r.status === "Filed" && (
                                <button
                                  className="p-1.5 hover:bg-[#86bc25]/10 text-gray-500 hover:text-[#86bc25] transition-colors"
                                  title="Download"
                                >
                                  <Download size={13} />
                                </button>
                              )}
                              <button
                                className="p-1.5 hover:bg-[#86bc25]/10 text-gray-500 hover:text-[#86bc25] transition-colors"
                                title="Open"
                              >
                                <ExternalLink size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-10 text-sm text-gray-500"
                        >
                          No reports match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-800 text-[10px] uppercase tracking-wider text-gray-500 font-bold flex items-center justify-between">
                <span>
                  Showing {filtered.length} of {REPORTS.length} reports
                </span>
                <span>Last sync: {new Date().toLocaleString("en-GB")}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
