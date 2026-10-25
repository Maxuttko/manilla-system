import { chromium } from "playwright";
import path from "path";

async function run() {
  const artifactDir = "C:\\Users\\maxeu\\.gemini\\antigravity\\brain\\368cbca8-558d-489f-92b7-64679bfd9bfe";
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.click("text=Linda Lukstiņa");
  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Click on #MNL-1052 card
  await page.click("text=#MNL-1052");
  await page.waitForTimeout(600);

  // Scroll to bottom of modal
  const scrollableModal = page.locator("div.overflow-y-auto").last();
  await scrollableModal.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_8_order_1052_audit_trail.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_8_order_1052_audit_trail.png");

  await browser.close();
}

run().catch(console.error);
