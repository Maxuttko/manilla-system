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
  await page.click("text=Ieva Kalniņa");
  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Scroll down page to show the bottom button of column 1
  await page.evaluate(() => window.scrollTo(0, 2000));
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(artifactDir, "live_kanban_col_bottom_expand_button.png"),
    fullPage: false,
  });
  console.log("Saved live_kanban_col_bottom_expand_button.png");

  await browser.close();
}

run().catch(console.error);
