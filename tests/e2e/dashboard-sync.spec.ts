import { test, expect, type Page } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS = path.join(__dirname, "screenshots");

const CREDS = {
  email: "sustainability-manager@deloitte.com",
  password: "manager123",
};

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: path.join(SCREENSHOTS, `sync-${name}.png`), fullPage: false });
}

test("dashboard loads assessments from DB after login", async ({ page }) => {
  // Clear localStorage then go directly to login — simulates a fresh browser session
  await page.goto("http://localhost:3000/login");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Log in
  await page.getByPlaceholder("you@deloitte.com").fill(CREDS.email);
  await page.getByPlaceholder("Enter your password").fill(CREDS.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\//, { timeout: 15_000 }); // any post-login redirect

  // Listen for the projects API call and log result
  const apiResponses: { url: string; status: number; body: string }[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/api/projects")) {
      const body = await response.text().catch(() => "(unreadable)");
      apiResponses.push({ url: response.url(), status: response.status(), body });
    }
  });

  // Navigate directly to the sustainability dashboard (All Assessments)
  await page.goto("http://localhost:3000/sustainability");
  await page.waitForLoadState("networkidle");
  await screenshot(page, "01-dashboard-loaded");

  // syncFromServer fires on mount — wait for API call to complete
  await page.waitForTimeout(4_000);
  console.log("API calls made:", JSON.stringify(apiResponses, null, 2));
  await screenshot(page, "02-after-sync");

  // Cards show the client name (or "Untitled Assessment" for bare DB projects)
  const cards = page.getByText(/Untitled Assessment|Assessment/i).filter({ hasText: /Assessment/ });
  const cardCount = await cards.count();

  console.log(`Dashboard: ${cardCount} assessment card(s) found`);
  await screenshot(page, "03-final");

  expect(cardCount, "Expected at least one assessment card to appear from DB sync").toBeGreaterThan(0);
});
