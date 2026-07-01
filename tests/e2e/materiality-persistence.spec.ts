/**
 * E2E: Persistence verification + edge-case tests for the 5-phase materiality workflow.
 *
 * Prerequisites: npm run dev:all must be running (Vite :3000, Hono API :8787).
 * Run AFTER phase2-to-report.spec.ts — this test seeds state from scratch
 * and then verifies it survives a hard page reload.
 *
 * Covers:
 *  A. Phase 1–3 seeded via Zustand (fast, no AI calls needed for persistence test).
 *  B. Phase 3 Final List toggle mechanism verified via live DOM.
 *  C. Save → hard reload → assert data survives (localStorage + server sync).
 *  D. Edge case: "Add SRRO" modal rejects submission when title is empty.
 *  E. Edge case: "Proceed to Phase 4" button is disabled until Final List is approved.
 */

import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS = path.join(__dirname, 'screenshots', 'persist');

const CREDS = { email: 'sustainability-manager@deloitte.com', password: 'manager123' };
const CLIENT = 'Persistence Test Corp';

async function ss(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOTS, `${name}.png`), fullPage: true });
}

async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('you@deloitte.com').fill(CREDS.email);
  await page.getByPlaceholder('Enter your password').fill(CREDS.password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('login'), { timeout: 20_000 });
}

/** Seed a project via the UI so it persists to the DB */
async function seedProject(page: Page) {
  // Clear state
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('sustainability-storage');
    localStorage.removeItem('auth-storage-v2');
  });

  await login(page);

  // Phase 1: fill governance basics
  await page.goto('/sustainability/governance-assessment');
  await page.waitForLoadState('networkidle');
  await page.getByPlaceholder('e.g. Heirs General Insurance Limited').fill(CLIENT);
  await page.getByPlaceholder('e.g. Insurance').fill('Banking');
  await page.getByPlaceholder('e.g. Lagos Island').fill('Abuja, Nigeria');
  await ss(page, '01-phase1-filled');

  // Phase 3: navigate, load sample data (no AI needed)
  await page.goto('/sustainability/srro-register');
  await page.waitForLoadState('networkidle');
  await ss(page, '02-phase3-empty');
  await page.getByRole('button', { name: /load sample data/i }).click();
  await page.waitForTimeout(500);
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);
  console.log(`Seeded ${rowCount} SRRO items from sample data`);
  await ss(page, '03-phase3-sample-loaded');
  return rowCount;
}

// ── Test A: Edge case — Add SRRO modal rejects empty title ────────────────────
test('A: SRRO modal: empty title is rejected', async ({ page }) => {
  await seedProject(page);

  // Open "Add SRRO" modal
  await page.getByRole('button', { name: /^Add SRRO$/i }).click();
  await expect(page.getByRole('heading', { name: /Add New SRRO/i })).toBeVisible();
  await ss(page, '04-add-modal-open');

  // Title is intentionally left empty; attempt to save
  const saveBtn = page.getByRole('button', { name: /Add SRRO/i }).last();
  await expect(saveBtn).toBeDisabled();
  await ss(page, '05-save-btn-disabled-empty-title');

  // Now type a title — button should enable
  await page.getByPlaceholder('SRRO title').fill('Test SRRO Title');
  await expect(saveBtn).toBeEnabled();
  await ss(page, '06-save-btn-enabled-after-title');

  // Cancel (don't save)
  await page.getByRole('button', { name: /Cancel/i }).click();
  await expect(page.getByRole('heading', { name: /Add New SRRO/i })).not.toBeVisible();
});

// ── Test B: Edge case — Proceed to Ph4 blocked until approved ─────────────────
test('B: Phase 3 proceed button disabled before approval', async ({ page }) => {
  await seedProject(page);

  // The "Proceed to Phase 4" button should be disabled initially
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const proceedBtn = page.getByRole('button', { name: /proceed to phase 4/i });
  await expect(proceedBtn).toBeDisabled();
  await ss(page, '07-proceed-btn-disabled-unapproved');
});

// ── Test C: Final List toggle mechanism ───────────────────────────────────────
test('C: Final List toggle: clicking cell cycles through Yes/No states', async ({ page }) => {
  await seedProject(page);

  // Sample data pre-seeds items with various Final List values.
  // Find the first row where Final List is NOT already "Yes" so we can toggle it.
  const allRows = page.locator('table tbody tr');
  await expect(allRows.first()).toBeVisible({ timeout: 10_000 });
  const count = await allRows.count();

  // Read tab label to get current final-list count
  const finalTabBefore = page.getByRole('button', { name: /Final List \(\d+\)/i });
  const tabTextBefore = await finalTabBefore.textContent();
  const matchBefore = tabTextBefore?.match(/\((\d+)\)/);
  const countBefore = matchBefore ? parseInt(matchBefore[1]) : 0;
  console.log(`Final list count before toggle: ${countBefore}`);

  // Find a row whose Final List button text is not "Yes"
  let targetRow = -1;
  for (let i = 0; i < Math.min(count, 20); i++) {
    const row = allRows.nth(i);
    const fl = row.locator('td').nth(13).locator('button');
    const txt = (await fl.textContent())?.trim() ?? '';
    if (txt !== 'Yes') { targetRow = i; break; }
  }

  if (targetRow === -1) {
    // All visible rows are already Yes — test the toggle cycle on row 0 (Yes → No → Yes)
    console.log('All rows already Yes — testing Yes→No cycle on row 0');
    const row = allRows.nth(0);
    const btn = row.locator('td').nth(13).locator('button');
    await btn.click();
    await page.waitForTimeout(300);
    const afterToggle = (await btn.textContent())?.trim();
    expect(afterToggle).toBe('No');
    await ss(page, '08-final-list-yes-to-no');

    // Tab count should decrease by 1
    const tabAfter = await finalTabBefore.textContent();
    const matchAfter = tabAfter?.match(/\((\d+)\)/);
    const countAfter = matchAfter ? parseInt(matchAfter[1]) : 0;
    expect(countAfter).toBe(countBefore - 1);
    await ss(page, '09-final-list-count-decreased');
    return;
  }

  // Toggle non-Yes row → should become Yes
  const row = allRows.nth(targetRow);
  const btn = row.locator('td').nth(13).locator('button');
  const beforeText = (await btn.textContent())?.trim() ?? '';
  console.log(`Row ${targetRow} Final List before: "${beforeText}"`);
  expect(beforeText).not.toBe('Yes');

  await btn.click();
  await page.waitForTimeout(300);
  const afterText = (await btn.textContent())?.trim();
  expect(afterText).toBe('Yes');
  await ss(page, '08-final-list-toggle-yes');

  // Tab label count should increase
  const tabTextAfter = await finalTabBefore.textContent();
  const matchAfter = tabTextAfter?.match(/\((\d+)\)/);
  const countAfter = matchAfter ? parseInt(matchAfter[1]) : 0;
  expect(countAfter).toBe(countBefore + 1);
  await ss(page, '09-final-list-count-increased');

  // Toggle again: Yes → No
  await btn.click();
  await page.waitForTimeout(300);
  const resetText = (await btn.textContent())?.trim();
  expect(resetText).toBe('No');
});

// ── Test D: Persistence — data survives hard reload ───────────────────────────
test('D: Phase 1 data survives hard reload', async ({ page }) => {
  await seedProject(page);

  // Go to governance phase and record what's there
  await page.goto('/sustainability/governance-assessment');
  await page.waitForLoadState('networkidle');

  const clientInput = page.getByPlaceholder('e.g. Heirs General Insurance Limited');
  const clientBefore = await clientInput.inputValue();
  expect(clientBefore).toBe(CLIENT);
  await ss(page, '10-phase1-before-reload');

  // Hard reload
  await page.reload({ waitUntil: 'networkidle' });

  const clientAfter = await page.getByPlaceholder('e.g. Heirs General Insurance Limited').inputValue();
  expect(clientAfter).toBe(CLIENT);
  await ss(page, '11-phase1-after-reload');
  console.log(`Phase 1 persistence: "${clientAfter}" survived reload`);
});

// ── Test E: Persistence — Phase 3 SRRO count survives hard reload ─────────────
test('E: Phase 3 SRRO items survive hard reload', async ({ page }) => {
  await seedProject(page);

  // Count items before reload
  await page.goto('/sustainability/srro-register');
  await page.waitForLoadState('networkidle');
  const countBefore = await page.locator('table tbody tr').count();
  expect(countBefore).toBeGreaterThan(0);
  await ss(page, '12-phase3-before-reload');

  // Hard reload
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const countAfter = await page.locator('table tbody tr').count();
  expect(countAfter).toBe(countBefore);
  await ss(page, '13-phase3-after-reload');
  console.log(`Phase 3 persistence: ${countAfter} SRRO items survived reload`);
});
