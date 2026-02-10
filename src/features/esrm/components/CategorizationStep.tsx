import React, { useState } from "react";
import {
  FileText,
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import ApproverModal from "./ApproverModal";
import type { PSQuestions } from "../types";
import {
  categorizationPerformanceStandards,
  step3Approvers,
} from "../data/formData";
import {
  downloadCSV,
  calculatePSScores,
  calculateCategorizationRiskCategory,
  getTriggeredPS,
  getCategoryStyles,
} from "../utils";
import { useApproverModal } from "../hooks";

const CategorizationStep: React.FC = () => {
  const [activeTab, setActiveTab] = useState("ps-questions");
  const {
    showModal,
    selectedApprover,
    expectedCompletionDate,
    setSelectedApprover,
    setExpectedCompletionDate,
    openModal,
    closeModal,
    handleSubmit,
  } = useApproverModal();
  const [psQuestions, setPsQuestions] = useState<PSQuestions>({
    ps1_q1: "",
    ps1_q2: "",
    ps1_q3: "",
    ps2_q1: "",
    ps2_q2: "",
    ps2_q3: "",
    ps3_q1: "",
    ps3_q2: "",
    ps3_q3: "",
    ps4_q1: "",
    ps4_q2: "",
    ps4_q3: "",
    ps5_q1: "",
    ps5_q2: "",
    ps5_q3: "",
    ps6_q1: "",
    ps6_q2: "",
    ps6_q3: "",
    ps7_q1: "",
    ps7_q2: "",
    ps7_q3: "",
    ps8_q1: "",
    ps8_q2: "",
    ps8_q3: "",
  });

  const tabs = [
    {
      id: "ps-questions",
      label: "PS1-PS8 Questions",
      icon: FileText,
      color: "text-orange-600",
    },
    {
      id: "categorization-result",
      label: "Categorization Result",
      icon: BarChart3,
      color: "text-amber-600",
    },
  ];

  const computeScores = () =>
    calculatePSScores(categorizationPerformanceStandards, psQuestions);

  const computeTotalScore = () => {
    const scores = computeScores();
    return Object.values(scores).reduce((total, score) => total + score, 0);
  };

  const computeRiskCategory = () =>
    calculateCategorizationRiskCategory(computeTotalScore());

  const computeTriggeredPS = () => getTriggeredPS(computeScores());

  const downloadCategorizationReport = () => {
    const scores = computeScores();
    const totalScore = computeTotalScore();
    const riskCategory = computeRiskCategory();
    const triggeredPS = computeTriggeredPS();

    const reportData = [
      ["Categorization Summary"],
      ["Client:", "Sample Client"],
      ["Project:", "Sample Project"],
      ["Sector:", "General"],
      [
        "Total Score:",
        `${totalScore} out of ${Object.keys(psQuestions).length} (${Math.round((totalScore / Object.keys(psQuestions).length) * 100)}%)`,
      ],
      ["Triggered PS:", triggeredPS],
      ["Final Risk Category:", riskCategory],
      [""],
      ["Performance Standard Scores"],
      ["Performance Standard", "Score"],
      ...categorizationPerformanceStandards.map((ps) => [
        ps.title,
        scores[ps.id].toString(),
      ]),
    ];

    downloadCSV(reportData, "Risk_Categorization_Report.csv");
  };

  const renderPSQuestions = () => (
    <div className="space-y-8">
      <div className="bg-[#FFF8E6] border border-[#86BC25] rounded-lg p-4 mb-6">
        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#86BC25]" />
          Performance Standards Assessment
        </h3>
        <p className="text-sm text-slate-700">
          Answer the following questions for each Performance Standard to
          determine the project's risk category.
        </p>
      </div>

      {categorizationPerformanceStandards.map((standard) => (
        <div
          key={standard.id}
          className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
        >
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25]">
            <h3 className="font-bold text-lg text-white">{standard.title}</h3>
          </div>
          <div className="p-6 space-y-6">
            {standard.questions.map((question) => (
              <div key={question.key} className="space-y-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {question.text}
                </p>
                <div className="flex space-x-6">
                  {["yes", "no", "na"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name={question.key}
                          value={option}
                          checked={psQuestions[question.key] === option}
                          onChange={(e) =>
                            setPsQuestions({
                              ...psQuestions,
                              [question.key]: e.target.value as
                                | "yes"
                                | "no"
                                | "na",
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 peer-checked:border-[#86BC25] peer-checked:bg-[#86BC25] transition-all relative"></div>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize font-medium group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        {option === "na" ? "N/A" : option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCategorizationResult = () => {
    const totalScore = computeTotalScore();
    const riskCategory = computeRiskCategory();
    const triggeredPS = computeTriggeredPS();
    const totalQuestions = Object.keys(psQuestions).length;

    return (
      <div className="space-y-6">
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
          <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25] flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">
              Categorization Summary
            </h3>
            <button
              onClick={downloadCategorizationReport}
              className="flex items-center gap-2 px-4 py-2 bg-[#86BC25] text-slate-900 rounded-lg hover:bg-[#e0a800] transition-colors text-sm font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-1">
                  Client Name
                </span>
                <div className="text-slate-900 dark:text-white font-medium">
                  Sample Client
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-1">
                  Project Name
                </span>
                <div className="text-slate-900 dark:text-white font-medium">
                  Sample Project
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-1">
                  Sector
                </span>
                <div className="text-slate-900 dark:text-white font-medium">
                  General
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                <span className="font-bold text-slate-500 text-xs uppercase tracking-wider block mb-1">
                  Total Score
                </span>
                <div className="text-slate-900 dark:text-white font-medium">
                  {totalScore} out of {totalQuestions} (
                  {Math.round((totalScore / totalQuestions) * 100)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Triggered Performance Standards
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 min-h-20">
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {triggeredPS}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Final Risk Category
                </h4>
                <div
                  className={`p-4 rounded-lg border flex items-center gap-3 min-h-20 ${getCategoryStyles(riskCategory)}`}
                >
                  <AlertTriangle className="w-6 h-6" />
                  <div>
                    <span className="text-lg font-bold block">
                      {riskCategory}
                    </span>
                    <span className="text-xs opacity-75">
                      Based on PS assessment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
            Submission & Approval
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Review the categorization results above. If correct, proceed to
            submit for approval by a senior risk officer.
          </p>

          <button
            onClick={openModal}
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold shadow-lg shadow-slate-900/20 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 mr-2 text-[#86BC25]" />
            Submit for Approval
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Risk Categorization
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Step 2: Determine project risk category based on Performance
            Standards
          </p>
        </div>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? "text-[#86BC25]" : ""}`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <ProgressBar currentStep={2} totalSteps={5} />

      {activeTab === "ps-questions"
        ? renderPSQuestions()
        : renderCategorizationResult()}

      <ApproverModal
        showModal={showModal}
        selectedApprover={selectedApprover}
        expectedCompletionDate={expectedCompletionDate}
        approverOptions={step3Approvers}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onApproverChange={setSelectedApprover}
        onDateChange={setExpectedCompletionDate}
        title="Submit for Approval"
        subtitle="Choose approver for categorization review"
      />
    </div>
  );
};

export default CategorizationStep;
