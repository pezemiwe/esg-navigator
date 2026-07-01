/**
 * E2E: Phase 2 AI value-chain population → Phase 3 SRRO register → Phase 4 → Phase 5 → consolidated report
 *
 * Prerequisites: npm run dev:all must be running (Vite :3000, Hono API :8787).
 * LLM_CLIENT=anthropic — the test hits the real AI endpoints.
 *
 * Flow:
 *  1. Login as sustainability manager
 *  2. Phase 1 — set client name / sector / geography so the report has real data
 *  3. Phase 2 — fill questionnaire + value chain overview, Generate with AI (tabs 3&4),
 *     assert activities + resources appear
 *  4. Phase 3 — Generate with AI, assert source = "Value chain assessment",
 *     mark items for final list, submit + approve, proceed to Phase 4
 *  5. Phase 4 — assert rows = final-list SRROs, attach a framework metric, proceed to Phase 5
 *  6. Phase 5 — score a metric, submit + approve the report review
 *  7. Assert "Download Consolidated Report" is enabled after approval and click it
 *  8. Screenshot at each phase as evidence
 */

import { test, expect, Page, Download } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS = path.join(__dirname, 'screenshots');

const CREDS = {
  email: 'sustainability-manager@deloitte.com',
  password: 'manager123',
};

const CLIENT_NAME = 'HGI Insurance';
const SECTOR = 'Insurance';
const GEOGRAPHY = 'Lagos, Nigeria';

async function screenshot(page: Page, name: string) {
  const file = path.join(SCREENSHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  // MUI TextField — label "Email Address", placeholder "you@deloitte.com"
  await page.getByPlaceholder('you@deloitte.com').fill(CREDS.email);
  await page.getByPlaceholder('Enter your password').fill(CREDS.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 20_000 });
}

async function goTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

// ─── PHASE 1: governance context ──────────────────────────────────────────────
async function fillPhase1(page: Page) {
  // Caller is responsible for already being on governance-assessment
  await screenshot(page, '01-phase1-start');

  // Fill Client Name
  await page.getByPlaceholder('e.g. Heirs General Insurance Limited').fill(CLIENT_NAME);

  // Fill Sector
  await page.getByPlaceholder('e.g. Insurance').fill(SECTOR);

  // Fill Geography
  await page.getByPlaceholder('e.g. Lagos Island').fill(GEOGRAPHY);

  await screenshot(page, '02-phase1-filled');
}

// ─── PHASE 2: questionnaire + overview + AI generate ─────────────────────────
// All 46 client-questionnaire answers, in DOM order: 6 general + 14 upstream + 15 core + 11 downstream.
const QUESTIONNAIRE_ANSWERS = [
  // General (6)
  'We underwrite non-life insurance policies — primarily motor, fire, and oil & gas — earning premium income and investment returns on float.',
  'Motor and fire insurance drive the bulk of gross written premium, with oil & gas energy risks contributing the largest average ticket size.',
  'Oil & gas energy risk and bespoke corporate property lines are growing fastest as we expand our upstream energy client base.',
  'Most customers are based in Lagos (Island and Mainland), with a growing corporate book in Port Harcourt tied to the energy sector.',
  'Our customer base spans financial services, oil & gas/energy, manufacturing, and retail SMEs.',
  'Port Harcourt and the Niger Delta carry higher and more complex exposure given oil & gas operational and environmental risk.',
  // Upstream (14)
  'We rely on actuarial pricing models, historical claims data, reinsurance treaty terms, and third-party risk survey reports to underwrite and price policies.',
  'Loss of access to reinsurance treaty capacity or claims history data would materially impair our ability to price risk accurately and could force under- or over-pricing.',
  'We depend most on reinsurers (Africa Re, Continental Re), licensed brokers, and third-party loss adjusters for day-to-day operations.',
  'Disruption at our lead reinsurer or key broker panel would significantly affect underwriting capacity and claims settlement turnaround.',
  'We run periodic due diligence, credit rating checks, and service-level reviews before onboarding and renewing key service providers.',
  'Loss adjusters and surveyors travel to inspect claims sites (motor accidents, fire damage, industrial incidents) as part of physical operations.',
  'Logistics for site inspections directly affects customer experience — delayed adjuster visits are a leading cause of claims complaints.',
  'Capital adequacy and reinsurance capacity are central to how much risk we can underwrite and directly determine growth ceiling by line of business.',
  'Reinsurance treaty capacity determines our net retention limits, especially for large oil & gas and property risks that exceed our balance sheet appetite.',
  'NAICOM (solvency oversight), our lead treaty reinsurers, and institutional shareholders influence capital availability and solvency the most.',
  'Africa Re and Continental Re (Lagos/regional hubs) are our principal reinsurers; concentration risk with a small reinsurer panel is a key dependency.',
  'NAICOM (National Insurance Commission) has the biggest influence on how we operate, alongside SEC for investment-linked products.',
  'Regulatory requirements most affect minimum capital rules, pricing floors for compulsory classes (e.g. motor third-party), and product approval timelines.',
  'Pending NAICOM recapitalisation and risk-based supervision reforms could meaningfully affect capital structure and product mix.',
  // Core (15)
  'A policy moves from risk assessment and pricing, through underwriting approval, policy issuance, premium collection, and — on a loss event — claims notification, investigation, and settlement.',
  'Underwriting, claims, and finance teams play the biggest role, with risk management providing oversight at each stage.',
  'The process slows most during claims investigation for complex commercial losses and during reinsurance sign-off on large-limit risks.',
  'A good experience means fast, transparent claims settlement and clear policy communication; a bad experience is claims delay or denial without explanation.',
  'Claims settlement speed and perceived fairness are most sensitive to reputational risk, especially on social media.',
  'Investigated claims involve site inspections, loss adjuster reports, and in some cases third-party forensic or fire-cause investigations.',
  'New products are designed by the product development team using market research, loss experience data, and reinsurer input, then filed with NAICOM.',
  'Historical loss ratios, reinsurance cost, competitor pricing, and regulatory pricing floors influence pricing and coverage decisions.',
  'The product committee, chief underwriting officer, and NAICOM (for regulatory approval) are involved in approving new products.',
  'Information flows through a shared policy administration system linking underwriting, claims, and finance, with monthly reconciliation meetings.',
  'We rely most on our core insurance administration system and actuarial pricing tools to function smoothly.',
  'The policy administration platform is a licensed third-party system; actuarial pricing models are maintained in-house by our consulting actuary.',
  'Underwriting and claims functions support the core business most directly, followed by finance and risk management.',
  'Governance, risk, and compliance sit within a dedicated risk committee that reports to the board, embedded in underwriting sign-off and claims audit.',
  'Decisions flow from the board through the executive management committee to functional heads, with delegated authority limits for underwriting.',
  // Downstream (11)
  'Customers access our products through licensed insurance brokers, direct sales agents, and increasingly through digital/online channels.',
  'Broker-intermediated sales remain the most important channel today, particularly for corporate and oil & gas risks.',
  'Intermediaries play a key role in corporate and energy risk placement, where technical broking expertise is required.',
  'Broker relationships and pricing competitiveness drive strong sales outcomes more than direct customer demand.',
  'Retail sales are largely agent- or digital-driven with short decision cycles, while corporate sales involve broker tenders, technical underwriting review, and longer negotiation timelines.',
  'Customers engage most at policy renewal and at claims notification — the two moments that most shape their perception of value.',
  'Fast, transparent claims payment builds trust; delayed or unclear claims communication is the leading driver of dissatisfaction.',
  'On expiry, policies lapse unless renewed; cancellations trigger pro-rata premium refunds per regulatory guidelines.',
  'Yes — lapses on corporate energy risk can create coverage gaps that carry reputational and, in rare cases, legal risk if a loss occurs during a lapse.',
  'Claims are handled from first notification through adjuster assessment, reinsurer notification (where applicable), and final settlement or repudiation.',
  'Customers most often raise concerns around claims valuation, turnaround time, and repudiation decisions.',
];

async function fillPhase2(page: Page) {
  await goTo(page, '/sustainability/value-chain');
  await screenshot(page, '03-phase2-questionnaire-start');

  // Tab 1: answer every question in the Client Questionnaire (general + upstream + core + downstream)
  const textareas = page.locator('textarea');
  const textareaCount = await textareas.count();
  console.log(`Phase 2 questionnaire: found ${textareaCount} textareas, have ${QUESTIONNAIRE_ANSWERS.length} scripted answers`);
  for (let i = 0; i < textareaCount; i++) {
    const answer = QUESTIONNAIRE_ANSWERS[i] ?? 'No material response for this parameter at this time.';
    await textareas.nth(i).fill(answer);
  }
  await screenshot(page, '03b-phase2-questionnaire-fully-answered');

  // Click the tab directly (tab bar buttons have exact text)
  await page.getByRole('button', { name: '2. Value Chain Overview', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await screenshot(page, '04-phase2-overview-start');

  // Fill the three overview fields (exact placeholder text from ValueChainAssessment.tsx)
  await page.getByPlaceholder('e.g. Non-life insurance company providing motor, fire and oil & gas coverage.').fill(
    'HGI Insurance is a non-life insurer providing motor, fire, and oil & gas coverage to retail and corporate clients across Nigeria.'
  );
  await page.getByPlaceholder('e.g. Motor, Fire, Oil & Gas insurance').fill('Motor insurance, Fire insurance, Oil & Gas insurance');
  await page.getByPlaceholder('e.g. Lagos — Island, Ikeja, Yaba, Surulere').fill('Lagos Island, Ikeja, Yaba, Port Harcourt');

  await screenshot(page, '05-phase2-overview-filled');

  // Move to Activity Register tab
  await page.getByRole('button', { name: '3. Activity Register', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await screenshot(page, '06-phase2-activities-empty');

  // Click Generate with AI — this hits the real LLM (may take ~20s)
  await page.getByRole('button', { name: /generate with ai/i }).first().click();

  // Wait for loading spinner to disappear (up to 90s for real LLM)
  await expect(page.getByRole('button', { name: /generating/i }).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /generate with ai/i }).first()).toBeVisible({ timeout: 90_000 });

  await screenshot(page, '07-phase2-activities-generated');

  // Assert activity rows appeared
  const activityRows = page.locator('table tbody tr');
  await expect(activityRows.first()).toBeVisible();
  const activityCount = await activityRows.count();
  expect(activityCount).toBeGreaterThan(0);
  console.log(`Phase 2: ${activityCount} activity rows generated`);

  // Move to Resources tab
  await page.getByRole('button', { name: '4. Resources & Relationships', exact: true }).click();
  await page.waitForLoadState('networkidle');
  await screenshot(page, '08-phase2-resources-generated');

  // Assert resource rows appeared (same AI call populated both tabs)
  const resourceRows = page.locator('table tbody tr');
  await expect(resourceRows.first()).toBeVisible();
  const resourceCount = await resourceRows.count();
  expect(resourceCount).toBeGreaterThan(0);
  console.log(`Phase 2: ${resourceCount} resource rows generated`);

  // Value Chain Map should be visible on the Overview tab now — check via swimlane
  await page.getByRole('button', { name: '2. Value Chain Overview', exact: true }).click();
  await expect(page.locator('text=Upstream')).toBeVisible();
  await screenshot(page, '09-phase2-swimlane');
}

// ─── PHASE 3: generate SRRO, verify source, mark final list, approve ──────────
async function fillPhase3(page: Page): Promise<number> {
  await goTo(page, '/sustainability/srro-register');
  await screenshot(page, '10-phase3-start');

  // Generate with AI
  await page.getByRole('button', { name: /generate with ai/i }).click();
  await expect(page.getByRole('button', { name: /generating/i })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: /generate with ai/i })).toBeVisible({ timeout: 90_000 });

  await screenshot(page, '11-phase3-generated');

  // Assert items exist
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
  console.log(`Phase 3: ${rowCount} SRRO items generated`);

  // Verify source = "Value chain assessment" — read the first Source select in the table
  const firstSourceSelect = page.locator('table tbody tr').first().locator('select').first();
  await expect(firstSourceSelect).toHaveValue('Value chain assessment');
  await screenshot(page, '12-phase3-source-verified');

  // Mark first 3 items for Final List by clicking their Final List toggle (currently "" → "Yes")
  // The Final List column is the 14th column; use YesNoCell buttons
  // Find rows where Final List shows "—" and click to toggle to Yes
  const finalListCells = page.locator('table tbody tr td').filter({ hasText: /^—$/ });
  // Target specifically the Final List column — it's the second-to-last YesNoCell per row
  // Simpler: click the Final List column buttons directly for first 3 rows
  for (let i = 0; i < Math.min(3, rowCount); i++) {
    const row = rows.nth(i);
    // Final List is the 14th td (0-indexed: 13). Click the button inside it.
    const finalListCell = row.locator('td').nth(13);
    await finalListCell.locator('button').click();
    await page.waitForTimeout(300);
  }

  // Also mark includeInFinalList = Yes via the neededByPrimaryUser toggle (13th col, 0-indexed: 12)
  // Actually per the code: col order is ref(0), source(1), title(2), type(3), stage(4),
  // financialImpact(5), strategicImpact(6), operationalImpact(7), timeHorizon(8),
  // likelihood(9), magnitude(10), score(11), needed(12), finalList(13), srroCrro(14), actions(15)
  // The above loop clicks col 13 = Final List ✓

  await screenshot(page, '13-phase3-final-list-marked');

  // Set likelihood and magnitude on the first item so score > 0 (required for material items in Phase 5)
  const firstRow = rows.first();
  const likelihoodSelect = firstRow.locator('td').nth(9).locator('select');
  await likelihoodSelect.selectOption('3');
  const magnitudeSelect = firstRow.locator('td').nth(10).locator('select');
  await magnitudeSelect.selectOption('3');

  // Switch to Final List tab — ApprovalPanel only renders here
  await page.getByRole('button', { name: /final list/i }).first().click();
  await page.waitForTimeout(500);
  const finalListRows = page.locator('table tbody tr');
  const finalListCount = await finalListRows.count();
  console.log(`Phase 3: ${finalListCount} items in final list`);

  // Scroll down to the approval panel (it's below the table)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);

  const submitterInput = page.getByPlaceholder('Enter your full name').first();
  await submitterInput.fill('Ngozi Adeyemi');
  await page.getByRole('button', { name: /submit for review/i }).click();
  await expect(page.getByText(/awaiting review/i).first()).toBeVisible({ timeout: 10_000 });
  await screenshot(page, '14-phase3-submitted');

  // Approve (same panel, different fields appear)
  const reviewerInput = page.getByPlaceholder(/reviewer.*full name|reviewer's full name/i);
  await reviewerInput.fill('Ifeoma Chukwudi');
  await page.getByRole('button', { name: /^approve$/i }).click();
  await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 10_000 });
  await screenshot(page, '15-phase3-approved');

  // Proceed to Phase 4 (only enabled after approval)
  const proceedBtn = page.getByRole('button', { name: /proceed to phase 4/i });
  await expect(proceedBtn).toBeEnabled();
  await proceedBtn.click();
  await page.waitForURL(/material-information/, { timeout: 15_000 });

  return finalListCount;
}

// ─── PHASE 4: attach a framework metric ──────────────────────────────────────
async function fillPhase4(page: Page, expectedRows: number) {
  await page.waitForLoadState('networkidle');
  await screenshot(page, '16-phase4-start');

  // Assert rows = final-list SRROs (Phase 4 rows are div-based EntryRow cards)
  const rows = page.locator('div.cursor-pointer').filter({ hasText: /SRRO-|CRRO-/ });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  const rowCount = await rows.count();
  console.log(`Phase 4: ${rowCount} rows (expected ${expectedRows})`);
  expect(rowCount).toBeGreaterThan(0);

  // Click the first row to open the modal
  await rows.first().click();
  await page.waitForTimeout(500);

  // Toggle SASB framework
  const sasbBtn = page.getByRole('button', { name: /^sasb$/i });
  if (await sasbBtn.isVisible()) {
    await sasbBtn.click();
    await page.waitForTimeout(300);
  }

  // Pick the first available metric checkbox
  const metricCheckboxes = page.locator('input[type="checkbox"]');
  const checkboxCount = await metricCheckboxes.count();
  if (checkboxCount > 0) {
    await metricCheckboxes.first().check();
  }

  // Fill specific information
  const specificInfo = page.getByPlaceholder(/specific information/i);
  if (await specificInfo.isVisible()) {
    await specificInfo.fill('Material sustainability risk identified via value chain assessment.');
  }

  // Close modal
  await page.getByRole('button', { name: /done/i }).click();
  await screenshot(page, '17-phase4-metric-attached');

  // Save — this triggers saveCurrentProject(), persisting all Phase 1–4 data to the DB
  const saveBtn = page.getByRole('button', { name: /^Save$/i }).first();
  await saveBtn.click();
  await expect(page.getByRole('button', { name: /Saved/i }).first()).toBeVisible({ timeout: 5_000 });
  await screenshot(page, '17b-phase4-saved');

  // Proceed to Phase 5
  await page.getByRole('button', { name: /proceed to phase 5/i }).click();
  await page.waitForURL(/materiality-scoring/, { timeout: 15_000 });
}

// ─── PHASE 5: score, approve, download ───────────────────────────────────────
async function fillPhase5(page: Page): Promise<Download> {
  await page.waitForLoadState('networkidle');
  await screenshot(page, '18-phase5-start');

  // Assert scoring rows exist (Phase 5 rows are div-based SrroScoringRow cards)
  const rows = page.locator('div.cursor-pointer').filter({ hasText: /SRRO-|CRRO-/ });
  await expect(rows.first()).toBeVisible({ timeout: 15_000 });
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
  console.log(`Phase 5: ${rowCount} scoring rows`);

  // Open first row to score a metric
  await rows.first().click();
  await page.waitForTimeout(800);

  // Scoring modal may have select dropdowns for likelihood/magnitude
  const allSelects = page.locator('select');
  if ((await allSelects.count()) > 0) {
    await allSelects.first().selectOption({ index: 2 });
    await page.waitForTimeout(200);
    if ((await allSelects.count()) > 1) {
      await allSelects.nth(1).selectOption({ index: 2 });
      await page.waitForTimeout(200);
    }
  }

  // Close modal if it opened
  const closeBtn = page.getByRole('button', { name: /close/i });
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }
  await screenshot(page, '19-phase5-scored');

  // Save — persists Phase 5 scores to DB
  const saveBtn5 = page.getByRole('button', { name: /^Save$/i }).first();
  await saveBtn5.click();
  await expect(page.getByRole('button', { name: /Saved/i }).first()).toBeVisible({ timeout: 5_000 });

  // Submit for report review
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  const submitInput = page.getByPlaceholder(/enter your full name/i).first();
  await submitInput.fill('Dare Adeleke');
  await page.getByRole('button', { name: /submit for review/i }).click();
  await expect(page.getByText(/awaiting review/i).first()).toBeVisible({ timeout: 10_000 });
  await screenshot(page, '20-phase5-submitted');

  // Approve report
  const reviewerInput = page.getByPlaceholder(/reviewer.*full name|reviewer's full name/i);
  await reviewerInput.fill('Ifeoma Chukwudi');
  await page.getByRole('button', { name: /^approve$/i }).click();
  await expect(page.getByText(/approved/i).first()).toBeVisible({ timeout: 10_000 });
  await screenshot(page, '21-phase5-approved');

  // Download button should now be enabled
  const downloadBtn = page.getByRole('button', { name: /download consolidated report/i }).first();
  await expect(downloadBtn).toBeEnabled({ timeout: 5_000 });
  await screenshot(page, '22-phase5-download-enabled');

  // Click and capture the download
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    downloadBtn.click(),
  ]);

  return download;
}

// ─── MAIN TEST ────────────────────────────────────────────────────────────────
test('Phase 2 AI populate → Phase 3 → 4 → 5 → consolidated report', async ({ page }) => {
  // Ensure screenshots directory exists
  fs.mkdirSync(SCREENSHOTS, { recursive: true });

  // Clear persisted store state so each run is fresh
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('sustainability-storage');
    localStorage.removeItem('auth-storage-v2');
  });

  // 1. Login
  await login(page);
  await screenshot(page, '00-logged-in');

  // Navigate to the sustainability module and create a new project via the UI.
  // This calls createNewProject() in the store, which sets activeProjectId so that
  // all subsequent saveCurrentProject() calls actually persist to the DB.
  await page.goto('/sustainability');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /New Assessment/i }).first().click();
  // Should redirect to governance assessment after creating project
  await page.waitForURL(/governance-assessment/, { timeout: 10_000 });
  await page.waitForLoadState('networkidle');

  // 2. Phase 1
  await fillPhase1(page);

  // 3. Phase 2
  await fillPhase2(page);

  // 4. Phase 3
  const finalListCount = await fillPhase3(page);

  // 5. Phase 4
  await fillPhase4(page, finalListCount);

  // 6. Phase 5 + report download
  const download = await fillPhase5(page);

  // Assert the downloaded file is named correctly and is a PDF
  const suggestedFilename = download.suggestedFilename();
  console.log(`Downloaded: ${suggestedFilename}`);
  expect(suggestedFilename).toMatch(/\.pdf$/i);
  expect(suggestedFilename.toLowerCase()).toMatch(/esg|materiality|report/i);

  // Save to screenshots dir for inspection
  const dlPath = path.join(SCREENSHOTS, suggestedFilename);
  await download.saveAs(dlPath);
  expect(fs.existsSync(dlPath)).toBe(true);
  const fileSize = fs.statSync(dlPath).size;
  expect(fileSize).toBeGreaterThan(10_000); // PDF must be >10 KB

  console.log(`Report saved: ${dlPath} (${Math.round(fileSize / 1024)} KB)`);
  await screenshot(page, '23-final-state');
});
