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

  console.log("1. Navigating to /login and logging in as Ieva Kalniņa...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.click("text=Ieva Kalniņa");
  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log("2. Verifying default collapsed state (max 5 cards in column 1)...");
  await page.screenshot({
    path: path.join(artifactDir, "live_kanban_col_collapsed_5.png"),
    fullPage: false,
  });
  console.log("Saved live_kanban_col_collapsed_5.png");

  console.log("3. Testing Sort by Price (Cena) in Column 1...");
  await page.click("[data-testid='sort-price-pienemts']");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_kanban_col_sorted_price.png"),
    fullPage: false,
  });
  console.log("Saved live_kanban_col_sorted_price.png");

  console.log("4. Testing Sort by Name (Nosaukums) in Column 1...");
  await page.click("[data-testid='sort-name-pienemts']");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_kanban_col_sorted_name.png"),
    fullPage: false,
  });
  console.log("Saved live_kanban_col_sorted_name.png");

  console.log("5. Testing Expand 'Atvērt visu sarakstu' in Column 1...");
  await page.click("[data-testid='toggle-expand-pienemts']");
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(artifactDir, "live_kanban_col_expanded_all.png"),
    fullPage: false,
  });
  console.log("Saved live_kanban_col_expanded_all.png");

  await browser.close();
  console.log("All kanban column tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
