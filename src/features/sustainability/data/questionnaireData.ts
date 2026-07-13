export interface QuestionnaireRow {
  id: string;
  section: string;
  parameter: string;
  sn: string;
  defaultText: string;
}

export const GENERAL_QUESTIONS = [
  { id: "g_1", sn: 1, text: "How would you describe the core way the business makes money, in simple terms? (key products or services)" },
  { id: "g_2", sn: 2, text: "What are the main insurance lines that really drive revenue today?" },
  { id: "g_3", sn: 3, text: "Are there any products that are growing faster or more strategically important?" },
  { id: "g_4", sn: 4, text: "Where do most of your customers sit geographically?" },
  { id: "g_5", sn: 5, text: "What sector do most of your customers operate in?" },
  { id: "g_6", sn: 6, text: "Are there markets or regions where risk exposure feels higher or more complex?" },
];

export const UPSTREAM_PARAMS = [
  {
    sn: 1, parameter: "Data Inputs",
    questions: [
      { id: "u_1_1", text: "What are the main pieces of information or resources you rely on to price policies and make underwriting decisions?" },
      { id: "u_1_2", text: "If some information or data were unavailable, what would make it difficult for the business to operate effectively?" },
    ],
  },
  {
    sn: 2, parameter: "Service Providers",
    questions: [
      { id: "u_2_1", text: "Which third parties do you rely on most to run day-to-day operations?" },
      { id: "u_2_2", text: "Are there vendors where disruption would significantly affect the day-to-day operations of underwriting, claims, or service delivery?" },
      { id: "u_2_3", text: "How do you currently select or manage key service providers?" },
    ],
  },
  {
    sn: 3, parameter: "Operational Coordination",
    questions: [
      { id: "u_3_1", text: "Are there any physical movements involved in how the business operates?" },
      { id: "u_3_2", text: "Is logistics mainly operational support, or does it affect customer experience in any way?" },
    ],
  },
  {
    sn: 4, parameter: "Financing / Investors",
    questions: [
      { id: "u_4_1", text: "How important is capital or reinsurance to your ability to underwrite risk and grow the business?" },
      { id: "u_4_2", text: "What role do capital and reinsurance play in determining how much risk you can take on?" },
    ],
  },
  {
    sn: 5, parameter: "External Parties",
    questions: [
      { id: "u_5_1", text: "Which external parties (reinsurers, investors, or lenders) influence capital availability or solvency the most?" },
      { id: "u_5_2", text: "Name these external parties. Where are they based (geography)? Could you identify the key risks associated with them?" },
    ],
  },
  {
    sn: 6, parameter: "Regulatory Environment",
    questions: [
      { id: "u_6_1", text: "Which regulators have the biggest influence on how you operate? (name them)" },
      { id: "u_6_2", text: "Where do regulatory requirements most affect product design or operations?" },
      { id: "u_6_3", text: "Are there areas where regulatory change could meaningfully affect the business?" },
    ],
  },
];

export const CORE_PARAMS = [
  {
    sn: 1, parameter: "Underwriting Operations",
    questions: [
      { id: "c_1_1", text: "Walk me through what happens from underwriting a policy to settling a claim." },
      { id: "c_1_2", text: "Which teams play the biggest role in making that process work smoothly?" },
      { id: "c_1_3", text: "At what points does the process tend to slow down or become more difficult?" },
    ],
  },
  {
    sn: 2, parameter: "Claims Management",
    questions: [
      { id: "c_2_1", text: "From the customer's perspective, what defines a good or bad experience with the company?" },
      { id: "c_2_2", text: "Which parts of service delivery are most sensitive to failure or reputational risk?" },
      { id: "c_2_3", text: "For claims that require investigation, what physical or on-site activities typically take place (e.g. inspections, loss assessments, third-party investigations)?" },
    ],
  },
  {
    sn: 3, parameter: "Product Development",
    questions: [
      { id: "c_3_1", text: "How do new insurance products typically get designed or updated?" },
      { id: "c_3_2", text: "What information influences pricing and coverage decisions?" },
      { id: "c_3_3", text: "Who is involved in approving new products?" },
    ],
  },
  {
    sn: 4, parameter: "Internal Coordination",
    questions: [
      { id: "c_4_1", text: "How does information move internally between underwriting, claims, finance, and risk?" },
      { id: "c_4_2", text: "Where do you rely most on systems (tools) or data to function smoothly?" },
      { id: "c_4_3", text: "Is it a third-party tool or is it controlled by a consultant?" },
      { id: "c_4_4", text: "Which functions support the core business the most?" },
    ],
  },
  {
    sn: 5, parameter: "Corporate Governance",
    questions: [
      { id: "c_5_1", text: "Where do governance, risk, and compliance sit in daily operations?" },
      { id: "c_5_2", text: "How do decisions flow from the top down?" },
    ],
  },
];

export const DOWNSTREAM_PARAMS = [
  {
    sn: 1, parameter: "Distribution Channels",
    questions: [
      { id: "d_1_1", text: "How do customers typically access your products?" },
      { id: "d_1_2", text: "Which channels are most important today?" },
      { id: "d_1_3", text: "Where do intermediaries play a key role?" },
    ],
  },
  {
    sn: 2, parameter: "Sales Process",
    questions: [
      { id: "d_2_1", text: "What typically drives strong sales outcomes — pricing, distribution channels, broker relationships, or customer demand?" },
      { id: "d_2_2", text: "Can you describe how selling to retail customers differs from selling to corporate clients (process, timelines, decision makers)?" },
    ],
  },
  {
    sn: 3, parameter: "Policyholder Experience",
    questions: [
      { id: "d_3_1", text: "How and when do customers typically engage with you most?" },
      { id: "d_3_2", text: "What drives trust or dissatisfaction?" },
    ],
  },
  {
    sn: 4, parameter: "Policy Closure",
    questions: [
      { id: "d_4_1", text: "What happens when a policy expires or is cancelled?" },
      { id: "d_4_2", text: "Does this stage create any operational or reputational risks?" },
    ],
  },
  {
    sn: 5, parameter: "After-sales Support",
    questions: [
      { id: "d_5_1", text: "How are claims handled end-to-end?" },
      { id: "d_5_2", text: "Where do customers most often raise concerns or disagreements during that process?" },
    ],
  },
];

export function getAllQuestionnaireRows(): QuestionnaireRow[] {
  const rows: QuestionnaireRow[] = GENERAL_QUESTIONS.map((q) => ({
    id: q.id,
    section: "General",
    parameter: "",
    sn: String(q.sn),
    defaultText: q.text,
  }));

  const addParamSection = (section: string, params: typeof UPSTREAM_PARAMS) => {
    for (const param of params) {
      for (const q of param.questions) {
        rows.push({
          id: q.id,
          section,
          parameter: param.parameter,
          sn: String(param.sn),
          defaultText: q.text,
        });
      }
    }
  };

  addParamSection("Upstream", UPSTREAM_PARAMS);
  addParamSection("Core", CORE_PARAMS);
  addParamSection("Downstream", DOWNSTREAM_PARAMS);
  return rows;
}

export function resolveQuestionText(
  id: string,
  overrides: Record<string, string>,
): string {
  const row = getAllQuestionnaireRows().find((r) => r.id === id);
  if (!row) return overrides[id] ?? "";
  return overrides[id] || row.defaultText;
}
