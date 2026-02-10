export const downloadCSV = (data: string[][], filename: string): void => {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const calculateESSRiskCategory = (
  exclusionData: Record<string, boolean>,
  riskQuestions: Record<string, string>,
): string => {
  const hasExclusions = Object.values(exclusionData).some((value) => value);
  if (hasExclusions) return "Excluded";
  const yesAnswers = Object.values(riskQuestions).filter(
    (answer) => answer === "yes",
  ).length;
  if (yesAnswers >= 6) return "Category A";
  if (yesAnswers >= 3) return "Category B";
  return "Category C";
};

export const calculatePSScores = (
  performanceStandards: { id: string; questions: { key: string }[] }[],
  psQuestions: Record<string, string>,
): Record<string, number> => {
  const scores: Record<string, number> = {};
  performanceStandards.forEach((ps) => {
    const yesCount = ps.questions.filter(
      (q) => psQuestions[q.key] === "yes",
    ).length;
    scores[ps.id] = yesCount;
  });
  return scores;
};

export const calculateCategorizationRiskCategory = (
  totalScore: number,
): string => {
  if (totalScore >= 12) return "Category A";
  if (totalScore >= 6) return "Category B";
  return "Category C";
};

export const getTriggeredPS = (scores: Record<string, number>): string => {
  const triggered = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([psId]) => psId.toUpperCase());
  return triggered.length > 0 ? triggered.join(", ") : "None";
};
