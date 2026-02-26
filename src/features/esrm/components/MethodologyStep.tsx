import React from "react";
import {
  BookOpen,
  Target,
  Settings,
  BarChart3,
  Info,
  CheckCircle,
} from "lucide-react";
import { performanceStandardWeits } from "../data/formData";

const MethodologyStep: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="border-b border-gray-200 dark:border-slate-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Methodology: Environmental & Social Risk Management Tool
            </h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white px-6 py-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-lg">
                  Overview of Environmental and Social Risk Management (ESRM)
                </h3>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  Environmental and Social Risk Management (ESRM) is a
                  structured framework that enables financial institutions to
                  identify, assess, mitigate, and monitor the environmental and
                  social risks associated with their lending and investment
                  activities. It ensures that projects comply with both national
                  regulations and international best practices while aligning
                  with sustainable development goals. ESRM is typically guided
                  by the International Finance Corporation (IFC) Performance
                  Standards (PS1–PS8), which address issues such as risk
                  assessment, labor conditions, pollution control, community
                  safety, land acquisition, biodiversity, indigenous peoples,
                  and cultural heritage.
                </p>
                <br />
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  The ESRM process follows seven core steps: Screening, Risk
                  Categorization, Environmental and Social Due Diligence (ESDD),
                  Development of Environmental and Social Action Plans (ESAPs),
                  Approval and Documentation, Monitoring and Supervision, and
                  Reporting. ESRM enables institutions to manage reputational
                  and credit risks while ensuring responsible financing aligned
                  with global ESG standards.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white px-6 py-4 flex items-center gap-3">
                <Target className="w-5 h-5" />
                <h3 className="font-bold text-lg">Objective</h3>
              </div>
              <div className="p-6 bg-amber-50 dark:bg-amber-900/10">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                  The primary objective of ESRM is to ensure that financial
                  institutions responsibly manage the environmental and social
                  risks associated with their lending and investment decisions.
                  It aims to prevent financing activities that may lead to
                  environmental degradation, human rights violations, or
                  community harm. ESRM promotes compliance with national laws
                  and international standards, particularly the IFC Performance
                  Standards. It enhances portfolio quality, protects
                  institutional reputation, and supports sustainable
                  development. ESRM also facilitates better risk-adjusted
                  returns by integrating non-financial risk factors into credit
                  assessments, enabling institutions to make informed, ethical,
                  and future-proof financing decisions.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white px-6 py-4 flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <h3 className="font-bold text-lg">Categorization Logic</h3>
              </div>
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10">
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4">
                  Projects are screened and categorized using IFC Performance
                  Standards (PS1–PS8).
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Trigger Questions under each PS are assigned binary
                      responses.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Each PS has a weight reflecting its risk significance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>
                      Final scores determine the E&S Risk Category: A, B, or C.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white px-6 py-4 flex items-center gap-3">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-bold text-lg">Scoring Method</h3>
              </div>
              <div className="p-6 bg-orange-50 dark:bg-orange-900/10">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-orange-200 dark:border-orange-800">
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-orange-100 bg-orange-100 dark:bg-orange-900/30">
                          Performance Standard
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-orange-100 bg-orange-100 dark:bg-orange-900/30">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-200 dark:divide-orange-800">
                      {performanceStandardWeits.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-slate-300 font-medium">
                            {item.standard}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700 dark:text-slate-300 font-semibold">
                            {item.weight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-neutral-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Info className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  Implementation Notes
                </h3>
              </div>
              <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <p>
                  <strong>Risk Categories:</strong> Category A (High Risk)
                  requires comprehensive ESIA and extensive monitoring. Category
                  B (Medium Risk) needs targeted assessments and regular
                  supervision. Category C (Low Risk) requires basic compliance
                  monitoring.
                </p>
                <p>
                  <strong>Continuous Improvement:</strong> The ESRM framework is
                  regularly updated to reflect evolving international standards,
                  regulatory requirements, and best practices in sustainable
                  finance.
                </p>
                <p>
                  <strong>Integration:</strong> ESRM is integrated into the
                  institution's overall risk management framework, ensuring
                  environmental and social considerations are embedded in all
                  lending and investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodologyStep;
