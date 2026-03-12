import React from "react";
import {
  BookOpen,
  Target,
  Settings,
  BarChart3,
  Info,
  CheckCircle,
  Globe,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Award,
  Layers,
  PieChart,
  Leaf,
  Heart,
  HandHeart,
  ScrollText,
  Calendar,
} from "lucide-react";

// Type definitions for data structures
interface RiskDimension {
  dimension: string;
  weight: string;
  description: string;
}

interface SectorRisk {
  sector: string;
  risk: "High" | "Medium" | "Low";
  typicalRisks: string;
}

interface IFCStandard {
  ps: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ESAPAction {
  action: string;
  description: string;
  responsible: string;
  timeline: string;
}

// Data constants
const RISK_DIMENSIONS: RiskDimension[] = [
  {
    dimension: "Sector Risk",
    weight: "15%",
    description:
      "Inherent environmental and social risk level of the economic sector based on industry benchmarks",
  },
  {
    dimension: "Project Characteristics",
    weight: "20%",
    description:
      "Scale, technical complexity, footprint, and operational intensity of the proposed activity",
  },
  {
    dimension: "IFC Performance Standards",
    weight: "40%",
    description:
      "Comprehensive assessment across all 8 IFC Performance Standards (PS1–PS8)",
  },
  {
    dimension: "Location Risk",
    weight: "15%",
    description:
      "Environmental sensitivity, protected areas, indigenous territories, and local governance capacity",
  },
  {
    dimension: "Client Track Record",
    weight: "10%",
    description:
      "Historical ESG performance, compliance incidents, and management commitment",
  },
];

const SECTOR_RISKS: SectorRisk[] = [
  {
    sector: "Mining & Metals",
    risk: "High",
    typicalRisks:
      "Land degradation, water pollution, biodiversity loss, community displacement",
  },
  {
    sector: "Oil & Gas",
    risk: "High",
    typicalRisks:
      "Greenhouse gas emissions, oil spills, water contamination, flaring",
  },
  {
    sector: "Large Infrastructure",
    risk: "High",
    typicalRisks:
      "Involuntary resettlement, ecosystem fragmentation, cultural heritage impact",
  },
  {
    sector: "Chemicals",
    risk: "High",
    typicalRisks: "Hazardous materials, industrial accidents, toxic emissions",
  },
  {
    sector: "Manufacturing",
    risk: "Medium",
    typicalRisks: "Waste management, air emissions, worker safety",
  },
  {
    sector: "Agriculture",
    risk: "Medium",
    typicalRisks:
      "Water consumption, deforestation, pesticide use, soil degradation",
  },
  {
    sector: "Forestry",
    risk: "Medium",
    typicalRisks: "Deforestation, illegal logging, biodiversity loss",
  },
  {
    sector: "Financial Services",
    risk: "Low",
    typicalRisks: "Indirect exposure through portfolio companies, greenwashing",
  },
  {
    sector: "Technology",
    risk: "Low",
    typicalRisks: "E-waste, supply chain labor conditions, data privacy",
  },
  {
    sector: "Healthcare",
    risk: "Low",
    typicalRisks: "Medical waste, clinical trial ethics, access to medicine",
  },
];

const IFC_STANDARDS: IFCStandard[] = [
  {
    ps: "PS1",
    title: "Assessment and Management",
    description:
      "Systematic assessment and management of environmental and social risks throughout the project lifecycle.",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    ps: "PS2",
    title: "Labor and Working Conditions",
    description:
      "Fair working conditions, occupational health and safety, and grievance mechanisms for workers.",
    icon: <Users className="w-5 h-5" />,
  },
  {
    ps: "PS3",
    title: "Resource Efficiency and Pollution Prevention",
    description:
      "Efficient use of resources, pollution control, greenhouse gas management, and waste minimization.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    ps: "PS4",
    title: "Community Health, Safety, and Security",
    description:
      "Prevention of community exposure to project-related risks, including infrastructure safety and security personnel.",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    ps: "PS5",
    title: "Land Acquisition and Involuntary Resettlement",
    description:
      "Avoid or minimize displacement, fair compensation, and livelihood restoration.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    ps: "PS6",
    title: "Biodiversity Conservation",
    description:
      "Protection of natural habitats, critical habitats, and legally protected areas.",
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    ps: "PS7",
    title: "Indigenous Peoples",
    description:
      "Respect for indigenous peoples' rights, free prior informed consent, and cultural preservation.",
    icon: <HandHeart className="w-5 h-5" />,
  },
  {
    ps: "PS8",
    title: "Cultural Heritage",
    description:
      "Protection of tangible and intangible cultural heritage from project impacts.",
    icon: <ScrollText className="w-5 h-5" />,
  },
];

const ESAP_ACTIONS: ESAPAction[] = [
  {
    action: "Compliance Gap Analysis",
    description:
      "Automated identification of non-conformities with IFC PS and local regulations",
    responsible: "ESG Officer",
    timeline: "Week 1",
  },
  {
    action: "Mitigation Plan Generation",
    description:
      "AI-driven recommendations for corrective actions with cost estimates",
    responsible: "Project Manager",
    timeline: "Week 2",
  },
  {
    action: "Responsibility Assignment",
    description:
      "Automated allocation of tasks to relevant teams based on expertise",
    responsible: "System",
    timeline: "Week 2",
  },
  {
    action: "Timeline Scheduling",
    description: "Dynamic scheduling of milestones with dependency tracking",
    responsible: "System",
    timeline: "Week 3",
  },
  {
    action: "Progress Monitoring",
    description: "Real-time dashboards for tracking implementation status",
    responsible: "ESG Committee",
    timeline: "Ongoing",
  },
  {
    action: "Audit Trail",
    description:
      "Immutable records of all actions and decisions for compliance",
    responsible: "System",
    timeline: "Continuous",
  },
];

// Subcomponent: Card Header
const CardHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  color?: string;
}> = ({ icon, title, color = "slate" }) => {
  const colorClasses =
    {
      slate:
        "from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900",
      amber:
        "from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700",
      emerald:
        "from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700",
      orange:
        "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700",
      indigo: "from-indigo-600 to-indigo-700",
      rose: "from-rose-500 to-rose-600",
      teal: "from-teal-500 to-teal-600",
      purple: "from-purple-500 to-purple-600",
      blue: "from-blue-500 to-blue-600",
    }[color] ||
    "from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900";

  return (
    <div
      className={`bg-gradient-to-r ${colorClasses} text-white px-6 py-4 flex items-center gap-3`}
    >
      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="font-bold text-lg tracking-tight">{title}</h3>
    </div>
  );
};

// Subcomponent: Risk Weight Bar
const RiskWeightBar: React.FC<{ weight: string }> = ({ weight }) => {
  const numericWeight = parseInt(weight.replace("%", ""));
  return (
    <div className="flex items-center gap-2 w-24">
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 dark:bg-orange-400 rounded-full"
          style={{ width: `${numericWeight}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
        {weight}
      </span>
    </div>
  );
};

// Main Component
const MethodologyStep: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-gray-200 dark:border-slate-700 mb-4">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              ESRM Framework v2.0
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Environmental & Social Risk Management
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto lg:mx-0">
            A comprehensive, data-driven methodology for identifying, assessing,
            and mitigating environmental and social risks in financed projects,
            aligned with global standards.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<BookOpen className="w-5 h-5" />}
              title="Overview of Environmental and Social Risk Management (ESRM)"
              color="slate"
            />
            <div className="p-6 lg:p-8 space-y-4 text-gray-700 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="font-semibold text-slate-800 dark:text-slate-200">
                  Environmental and Social Risk Management (ESRM)
                </strong>{" "}
                is a structured governance framework used by financial
                institutions to identify, evaluate, mitigate, and monitor
                environmental and social risks arising from financing activities
                such as loans, project finance, investments, and advisory
                mandates.
              </p>
              <p>
                The ESRM framework protects financial institutions from exposure
                to non-financial risks that may translate into financial losses
                including environmental damage, regulatory penalties, community
                opposition, operational disruptions, and reputational risks. It
                ensures that financed projects contribute positively to
                sustainable development while avoiding harm.
              </p>
              <p>
                ESRM implementation is guided by globally recognized frameworks
                including the <strong>IFC Performance Standards</strong>, the{" "}
                <strong>Equator Principles</strong>, and international ESG
                governance frameworks such as the{" "}
                <strong>
                  UN Guiding Principles on Business and Human Rights
                </strong>{" "}
                and the <strong>SASB Standards</strong>.
              </p>
              <p>
                Automated ESRM tools streamline screening, risk scoring,
                compliance management, and monitoring throughout the lifecycle
                of financed projects, enabling real-time risk assessment and
                portfolio-level insights.
              </p>
            </div>
          </div>

          {/* Objectives Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<Target className="w-5 h-5" />}
              title="Objectives of the ESRM Framework"
              color="amber"
            />
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Integrate environmental and social considerations into credit and investment decisions.",
                  "Prevent financing activities that may cause environmental damage or social harm.",
                  "Ensure compliance with international sustainability standards and local regulations.",
                  "Strengthen transparency and stakeholder accountability through robust disclosure.",
                  "Enhance portfolio resilience by identifying and mitigating ESG risks early.",
                  "Support clients in improving their ESG performance and accessing green finance.",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30"
                  >
                    <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Assessment Process Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<Settings className="w-5 h-5" />}
              title="Environmental and Social Risk Assessment Process"
              color="emerald"
            />
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    step: "Screening",
                    desc: "Initial review of project sector, location, and activities against exclusion lists and risk triggers.",
                  },
                  {
                    step: "Risk Categorization",
                    desc: "Classification into Category A (high risk), B (medium), or C (low) based on potential impacts.",
                  },
                  {
                    step: "Due Diligence",
                    desc: "Detailed environmental and social impact assessment, including site visits and stakeholder consultations.",
                  },
                  {
                    step: "Mitigation Planning",
                    desc: "Development of Environmental and Social Action Plans (ESAP) with specific measures and timelines.",
                  },
                  {
                    step: "Monitoring",
                    desc: "Continuous compliance tracking through reports, audits, and site inspections.",
                  },
                  {
                    step: "Reporting",
                    desc: "Regular disclosure to stakeholders and regulatory bodies, including annual ESG reports.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {item.step}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Scoring Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<BarChart3 className="w-5 h-5" />}
              title="Risk Scoring Methodology"
              color="orange"
            />
            <div className="p-6 lg:p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-orange-200 dark:border-orange-800">
                      <th className="text-left py-3 px-4 text-sm font-bold text-orange-800 dark:text-orange-300">
                        Dimension
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-orange-800 dark:text-orange-300">
                        Weight
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-orange-800 dark:text-orange-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200 dark:divide-orange-800">
                    {RISK_DIMENSIONS.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {row.dimension}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-orange-600 dark:text-orange-400">
                          <RiskWeightBar weight={row.weight} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                          {row.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-700 dark:text-slate-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  The final risk score is calculated as a weighted sum, then
                  mapped to a risk category. Additional overrides may apply for
                  severe impacts.
                </p>
              </div>
            </div>
          </div>

          {/* IFC Performance Standards Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<Award className="w-5 h-5" />}
              title="IFC Performance Standards Framework"
              color="indigo"
            />
            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {IFC_STANDARDS.map((item, i) => (
                  <div
                    key={i}
                    className="group p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300">
                      <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                        {item.icon}
                      </div>
                      <h4 className="font-semibold">{item.ps}</h4>
                    </div>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sector Risk Matrix Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<Layers className="w-5 h-5" />}
              title="Sector Environmental & Social Risk Matrix"
              color="rose"
            />
            <div className="p-6 lg:p-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-rose-200 dark:border-rose-800">
                      <th className="text-left py-3 px-4 text-sm font-bold text-rose-800 dark:text-rose-300">
                        Sector
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-rose-800 dark:text-rose-300">
                        Risk Level
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-rose-800 dark:text-rose-300">
                        Typical Risks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-200 dark:divide-rose-800">
                    {SECTOR_RISKS.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-rose-100/50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm font-semibold text-gray-800 dark:text-slate-200">
                          {row.sector}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              row.risk === "High"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : row.risk === "Medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {row.risk}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-slate-400">
                          {row.typicalRisks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ESAP Automation Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden transition-all hover:shadow-2xl">
            <CardHeader
              icon={<CheckCircle className="w-5 h-5" />}
              title="Environmental and Social Action Plan (ESAP) Automation"
              color="teal"
            />
            <div className="p-6 lg:p-8">
              <div className="space-y-4">
                {ESAP_ACTIONS.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800"
                  >
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-teal-700 dark:text-teal-300">
                        {item.action}
                      </span>
                    </div>
                    <p className="flex-1 text-sm text-gray-600 dark:text-slate-400">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {item.responsible}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {item.timeline}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Portfolio Monitoring Card */}
          <div className="bg-gradient-to-br from-slate-50 to-neutral-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <TrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Portfolio ESG Monitoring and Analytics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Climate Exposure</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Aggregated carbon footprint, physical risk hotspots, and
                  transition risk metrics across portfolio.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Compliance Performance</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Real-time tracking of regulatory compliance, incident reports,
                  and audit findings.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <PieChart className="w-4 h-4" />
                  <span className="font-medium">
                    Sector Sustainability Trends
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Benchmarking against industry peers, ESG rating changes, and
                  emerging risks.
                </p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong className="font-medium">TCFD & GRI Alignment:</strong>{" "}
                Automated reporting aligned with Task Force on Climate-related
                Financial Disclosures (TCFD) and Global Reporting Initiative
                (GRI) standards, enabling sustainability disclosures and
                investor communication.
              </p>
            </div>
          </div>

          {/* Footer References */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
            <p>
              Based on IFC Performance Standards, Equator Principles, and UN
              Guiding Principles on Business and Human Rights. v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyStep;
