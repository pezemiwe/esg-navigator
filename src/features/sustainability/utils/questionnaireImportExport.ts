import {
  getAllQuestionnaireRows,
  resolveQuestionText,
} from "../data/questionnaireData";
import { buildCsv, downloadCsv, parseSpreadsheetFile } from "./csvUtils";

export interface QuestionnaireImportRow {
  id: string;
  section: string;
  parameter: string;
  question: string;
  answer: string;
}

const TEMPLATE_HEADERS = ["Question ID", "Section", "Parameter", "Question", "Answer"];

export function downloadQuestionnaireTemplate(
  questionOverrides: Record<string, string>,
  existingResponses: Record<string, string>,
  clientName: string,
): void {
  const rows = getAllQuestionnaireRows().map((q) => [
    q.id,
    q.section,
    q.parameter,
    resolveQuestionText(q.id, questionOverrides),
    existingResponses[q.id] ?? "",
  ]);

  const csv = buildCsv(TEMPLATE_HEADERS, rows);
  const safeName = clientName.replace(/\s+/g, "_") || "Client";
  downloadCsv(`${safeName}_Value_Chain_Questionnaire_Template.csv`, csv);
}

function pickField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val) return val;
  }
  return "";
}

export async function parseQuestionnaireUpload(
  file: File,
  questionOverrides: Record<string, string>,
): Promise<QuestionnaireImportRow[]> {
  const raw = await parseSpreadsheetFile(file);
  const allQuestions = getAllQuestionnaireRows();
  const byId = new Map(allQuestions.map((q) => [q.id, q]));
  const byText = new Map(
    allQuestions.map((q) => [
      resolveQuestionText(q.id, questionOverrides).toLowerCase().trim(),
      q,
    ]),
  );

  const results: QuestionnaireImportRow[] = [];

  for (const row of raw) {
    const id = pickField(row, "question_id", "id");
    const questionText = pickField(row, "question", "questions");
    const answer = pickField(row, "answer", "answers", "response", "responses");

    if (!answer.trim()) continue;

    let matched = id ? byId.get(id) : undefined;
    if (!matched && questionText) {
      matched = byText.get(questionText.toLowerCase().trim());
    }
    if (!matched) continue;

    results.push({
      id: matched.id,
      section: matched.section,
      parameter: matched.parameter,
      question: resolveQuestionText(matched.id, questionOverrides),
      answer: answer.trim(),
    });
  }

  return results;
}
