import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  Button,
  Stack,
  LinearProgress,
} from "@mui/material";
import { Download, Printer, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNaira,
  formatNumber,
  getRiskLevel,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

export default function AIReport() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    entityProfile,
    risks,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
    templates,
    stakeholderSurveys,
    reportDraft,
    setReportDraft,
  } = useSustainabilityStore();

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  const readinessChecks = [
    { label: "Entity Profile", ready: entityProfile.completed },
    { label: "Risk Register (≥10 risks)", ready: risks.length >= 10 },
    {
      label: "Material Topics Selected",
      ready: selectedMaterialTopicIds.length > 0,
    },
    { label: "Scope 1 Data", ready: scope1Assets.length > 0 },
    { label: "Scope 2 Data", ready: scope2Entries.length > 0 },
    { label: "Scope 3 Data", ready: scope3Entries.length > 0 },
    { label: "Scenario Analysis (≥1 run)", ready: scenarioResults.length > 0 },
    { label: "Data Templates Generated", ready: templates.length > 0 },
  ];

  const readyCount = readinessChecks.filter((c) => c.ready).length;
  const readyPct = Math.round((readyCount / readinessChecks.length) * 100);

  const generateReport = () => {
    setGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const report = `
SUSTAINABILITY & CLIMATE RISK DISCLOSURE REPORT
IFRS S1 / IFRS S2 ALIGNED

Prepared for: ${entityProfile.name}
Report Date: ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
Reporting Period: FY 2025
Framework Alignment: IFRS S1, IFRS S2, GHG Protocol, PCAF, SASB — Commercial Banking


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXECUTIVE SUMMARY

${entityProfile.name} presents this comprehensive sustainability disclosure aligned with the International Financial Reporting Standards (IFRS) S1 and S2 requirements. As a leading Nigerian commercial bank with ${entityProfile.branches} branches, ${entityProfile.employees.toLocaleString()} employees, and a total loan book of ${formatNaira(entityProfile.loanBook)}, the Bank recognizes its responsibility as a significant financial intermediary in driving Nigeria's transition to a low-carbon economy.

This report identifies ${risks.length} sustainability-related risks, of which ${selectedMaterialTopicIds.length} have been assessed as material. Total greenhouse gas emissions for FY 2025 are estimated at ${formatNumber(totalEmissions)} tCO₂e across all three scopes. ${scenarioResults.length > 0 ? `${scenarioResults.length} climate scenario(s) have been modeled to assess financial resilience.` : "Climate scenario analysis is pending completion."}


2. GOVERNANCE (IFRS S1)

2.1 Board Oversight
The Board of Directors maintains oversight of sustainability-related risks through the Board Risk Committee (BRC), which meets quarterly to review climate risk exposures, ESG performance metrics, and regulatory compliance status.

2.2 Management's Role
The Chief Risk Officer (CRO) is responsible for integrating sustainability risks into the enterprise risk management framework. The Sustainability Steering Committee, comprising senior executives from Risk, Credit, Operations, and Compliance functions, oversees material topic assessments and disclosure preparation.

2.3 Internal Controls
The Bank has established internal controls and assurance processes to ensure the reliability and completeness of sustainability disclosures. Data collection templates have been deployed across ${templates.length} material topic areas, with departmental accountability assigned to relevant business units.


3. STRATEGY (IFRS S1 & S2)

3.1 Entity Profile & Value Chain
${entityProfile.description}

Core Banking Services: ${entityProfile.coreServices.join(", ")}

Upstream Activities: ${entityProfile.upstreamActivities.join(", ")}

Downstream Activities (Financed): ${entityProfile.downstreamActivities.join(", ")}

3.2 Sector Exposure Profile
The Bank's loan portfolio is distributed across ${entityProfile.sectorExposures.length} sectors:
${entityProfile.sectorExposures.map((s) => `  • ${s.sector}: ${s.percentage}% (${formatNaira((entityProfile.loanBook * s.percentage) / 100)})`).join("\n")}

3.3 Geographic Exposure
Key operating regions with associated climate risk profiles:
${entityProfile.geographicExposure.map((g) => `  • ${g}`).join("\n")}

3.4 Strategic Impact Assessment
The Bank's strategy is exposed to both transition and physical climate risks, with particular concentration in the Oil & Gas sector (${entityProfile.sectorExposures.find((s) => s.sector === "Oil & Gas")?.percentage || 0}% of loan book) and Lagos coastal exposure. The dual materiality assessment identified ${selectedMaterialTopicIds.length} topics requiring strategic response.


4. RISK MANAGEMENT (IFRS S1)

4.1 Risk Identification Process
The Bank employs a multi-source risk identification approach:
  • Enterprise Risk Management (ERM) Register: ${risks.filter((r) => r.source === "erm").length} risks identified
  • Stakeholder Surveys: ${stakeholderSurveys.length} surveys conducted, ${risks.filter((r) => (r.source as string) === "stakeholder").length} risks captured
  • SASB Standards Alignment: ${risks.filter((r) => r.source === "sasb").length} financially material topics identified
  • Leadership Workshops: ${risks.filter((r) => r.source === "workshop").length} risks from strategic sessions

4.2 Material Topics (Top ${selectedMaterialTopicIds.length})
${selectedRisks
  .map((r, i) => {
    const score = r.impact * r.likelihood;
    return `  ${i + 1}. ${r.name}
     Category: ${r.category} | Score: ${score} (${getRiskLevel(score)})
     Financial Effect: ${r.financialEffect} | Time Horizon: ${r.timeHorizon}`;
  })
  .join("\n\n")}

4.3 Risk Rating Distribution
  • Critical (≥20): ${risks.filter((r) => r.impact * r.likelihood >= 20).length} risks
  • High (12-19): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 12 && s < 20;
    }).length
  } risks
  • Medium (6-11): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 6 && s < 12;
    }).length
  } risks
  • Low (<6): ${risks.filter((r) => r.impact * r.likelihood < 6).length} risks


5. CLIMATE-RELATED RISKS & OPPORTUNITIES (IFRS S2)

5.1 Transition Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Transition Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No transition risks identified in material topics."
}

5.2 Physical Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Physical Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No physical risks identified in material topics."
}

5.3 Additional Material Categories
${
  selectedRisks
    .filter(
      (r) => !["Transition Risk", "Physical Risk"].includes(r.subcategory),
    )
    .map(
      (r) =>
        `  • ${r.name} (${r.subcategory}): Score ${r.impact * r.likelihood}`,
    )
    .join("\n") || "  • None."
}


6. GREENHOUSE GAS EMISSIONS (IFRS S2 / GHG Protocol)

6.1 Scope 1 — Direct Emissions
Source: Owned fuel combustion (generators, fleet vehicles)
Total: ${formatNumber(s1)} tCO₂e
Assets tracked: ${scope1Assets.length}
${scope1Assets.map((a) => `  • ${a.name} (${a.branch}): ${a.fuelType} — ${formatNumber(a.litersPerMonth * a.months * (a.fuelType === "diesel" ? 2.68 : a.fuelType === "petrol" ? 2.31 : a.fuelType === "lpg" ? 1.51 : 2.0))} tCO₂e`).join("\n")}

6.2 Scope 2 — Indirect Emissions (Purchased Electricity)
Source: Grid electricity and private power purchase
Total: ${formatNumber(s2)} tCO₂e
Branch locations: ${scope2Entries.length}
Nigeria grid emission factor: 0.43 kgCO₂/kWh

6.3 Scope 3 — Financed Emissions (Category 15)
Methodology: PCAF Global GHG Accounting Standard
Total: ${formatNumber(s3)} tCO₂e
${scope3Entries.map((e) => `  • ${e.sector}: ${formatNaira(e.loanExposure)} exposure → ${formatNumber(e.loanExposure * e.intensityFactor)} tCO₂e`).join("\n")}

6.4 Emissions Summary
  Total GHG Footprint: ${formatNumber(totalEmissions)} tCO₂e
  Scope 1 share: ${totalEmissions > 0 ? ((s1 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 2 share: ${totalEmissions > 0 ? ((s2 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 3 share: ${totalEmissions > 0 ? ((s3 / totalEmissions) * 100).toFixed(1) : 0}%

  Scope 3 financed emissions dominate the Bank's carbon footprint, consistent with the emissions profile of financial institutions globally.


7. SCENARIO ANALYSIS (IFRS S2)

${
  scenarioResults.length > 0
    ? scenarioResults
        .map(
          (r) => `7.x ${r.name}
  Description: ${r.description}
  Estimated Financial Cost: ${formatNaira(r.estimatedCost)}
  Profit Impact: ${r.profitImpact.toFixed(3)}%
  Projected NPL Increase: +${r.nplIncrease}%
  Capital Adequacy Effect: ${r.capitalAdequacyEffect.toFixed(1)}%
  Analysis Date: ${new Date(r.runAt).toLocaleDateString()}
`,
        )
        .join("\n")
    : "  Scenario analysis has not yet been conducted. IFRS S2 requires climate scenario analysis covering at least transition and physical risk scenarios."
}


8. METRICS & TARGETS

8.1 Key Performance Indicators
  • Total sustainability risks tracked: ${risks.length}
  • Material topics under active management: ${selectedMaterialTopicIds.length}
  • GHG emissions intensity: ${entityProfile.loanBook > 0 ? (totalEmissions / (entityProfile.loanBook / 1e9)).toFixed(2) : "N/A"} tCO₂e per ₦B loan book
  • Data collection templates deployed: ${templates.length}
  • Template completion rate: ${templates.length > 0 ? Math.round((templates.filter((t) => t.status === "submitted" || t.status === "approved").length / templates.length) * 100) : 0}%
  • Stakeholder engagement surveys: ${stakeholderSurveys.length}

8.2 Targets
  The Bank commits to:
  • Reducing Scope 1 emissions by 15% by FY 2028 through fleet electrification and solar installations
  • Achieving 30% renewable energy procurement for branch operations by FY 2030
  • Reducing financed emissions intensity by 20% across high-carbon sectors by FY 2030
  • Achieving 100% IFRS S1/S2 disclosure compliance by FY 2026


9. DATA GOVERNANCE & ASSURANCE

Data collection responsibilities have been assigned across ${new Set(templates.map((t) => t.department)).size} departments. All sustainability data undergoes internal verification before disclosure. The Bank intends to obtain limited assurance over its GHG emissions data from an independent assurance provider.


10. REGULATORY ALIGNMENT

This report has been prepared in alignment with:
  • IFRS S1 — General Requirements for Disclosure of Sustainability-related Financial Information
  • IFRS S2 — Climate-related Disclosures
  • GHG Protocol Corporate Standard
  • PCAF Global GHG Accounting and Reporting Standard
  • SASB Standards — Commercial Banks
  • CBN Sustainable Banking Principles
  • Nigeria's Nationally Determined Contribution (NDC) commitments


11. FORWARD-LOOKING STATEMENTS

This report contains forward-looking statements regarding the Bank's climate strategy, emission reduction targets, and scenario analysis outcomes. These statements are based on current expectations and assumptions and are subject to risks and uncertainties, including regulatory changes, macroeconomic conditions, and climate science developments.


12. APPROVAL

This Sustainability & Climate Risk Disclosure Report has been reviewed and approved by the Board Risk Committee of ${entityProfile.name}.

Prepared by: Sustainability Reporting Division
Report Classification: CONFIDENTIAL — FOR REGULATORY & INVESTOR USE


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} ${entityProfile.name}. All Rights Reserved.
Powered by GCB ESG Navigator — Deloitte Nigeria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

      setReportDraft(report);
      setGenerating(false);
    }, 3000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            color: BRAND,
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.7rem",
          }}
        >
          AI REPORT GENERATION
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          IFRS S1/S2 Disclosure Report
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Auto-generate a comprehensive sustainability disclosure report aligned
          with IFRS S1/S2, GHG Protocol, and SASB standards
        </Typography>
      </Box>

      {!reportDraft && (
        <>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(BRAND, isDark ? 0.06 : 0.03),
              border: `1px solid ${alpha(BRAND, 0.12)}`,
              mb: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Report Readiness Assessment
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND }}>
                {readyPct}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={readyPct}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(BRAND, 0.1),
                "& .MuiLinearProgress-bar": { bgcolor: BRAND, borderRadius: 4 },
                mb: 2,
              }}
            />
            <Grid container spacing={1.5}>
              {readinessChecks.map((check) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={check.label}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(check.ready ? "#10b981" : "#94a3b8", 0.06),
                      border: `1px solid ${alpha(check.ready ? "#10b981" : "#94a3b8", 0.1)}`,
                    }}
                  >
                    {check.ready ? (
                      <CheckCircle2 size={16} color="#10b981" />
                    ) : (
                      <Clock size={16} style={{ opacity: 0.4 }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: check.ready ? "#10b981" : "text.secondary",
                      }}
                    >
                      {check.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: "center",
            }}
          >
            <Sparkles size={48} style={{ color: BRAND, marginBottom: 16 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
              Generate Sustainability Disclosure Report
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", maxWidth: 500, mx: "auto", mb: 3 }}
            >
              The AI engine will compile all entity data, risk assessments,
              emissions calculations, and scenario results into a professionally
              formatted IFRS S1/S2 disclosure report.
            </Typography>

            {generating && (
              <Box sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(BRAND, 0.1),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: BRAND,
                      borderRadius: 3,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 1, display: "block" }}
                >
                  {progress < 30
                    ? "Compiling entity profile and value chain data..."
                    : progress < 60
                      ? "Analyzing risk register and materiality assessment..."
                      : progress < 85
                        ? "Calculating emissions and scenario results..."
                        : "Generating IFRS S1/S2 aligned narrative..."}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              size="large"
              startIcon={<Sparkles size={18} />}
              onClick={generateReport}
              disabled={generating}
              sx={{
                bgcolor: BRAND,
                color: "#fff",
                fontWeight: 700,
                borderRadius: 2,
                px: 5,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { bgcolor: alpha(BRAND, 0.9) },
              }}
            >
              {generating ? "Generating Report..." : "Generate Report"}
            </Button>
          </Paper>
        </>
      )}

      {reportDraft && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<Sparkles size={16} />}
              onClick={generateReport}
              disabled={generating}
              sx={{
                bgcolor: BRAND,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: alpha(BRAND, 0.9) },
              }}
            >
              Regenerate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Printer size={16} />}
              onClick={() => window.print()}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha(BRAND, 0.3),
                color: BRAND,
              }}
            >
              Print Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={() => {
                const blob = new Blob([reportDraft], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${entityProfile.name.replace(/\s+/g, "_")}_Sustainability_Report_${new Date().getFullYear()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha("#3b82f6", 0.3),
                color: "#3b82f6",
              }}
            >
              Download Report
            </Button>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 3,
              bgcolor: isDark ? alpha("#fff", 0.03) : "#FFFFFF",
              border: `1px solid ${borderColor}`,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              "& pre": {
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "0.85rem",
                lineHeight: 1.8,
                color: isDark ? alpha("#fff", 0.85) : "#1a1a1a",
                margin: 0,
              },
            }}
          >
            <pre>{reportDraft}</pre>
          </Paper>
        </>
      )}
    </Box>
  );
}
