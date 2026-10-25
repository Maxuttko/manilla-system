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

  console.log("1. Navigating to /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.click("text=Ieva Kalniņa");
  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  console.log("2. Testing Click on Self -> Opening Personal Profile Modal...");
  await page.click("[data-testid='user-profile-button']");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_split_1_personal_profile_modal.png"),
    fullPage: false,
  });
  console.log("Saved live_split_1_personal_profile_modal.png");

  // Close personal profile modal
  await page.click("button:has-text('Aizvērt')");
  await page.waitForTimeout(400);

  console.log("3. Testing Click on Down Arrow -> Opening Switch Dropdown...");
  await page.click("[data-testid='switch-dropdown-button']");
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(artifactDir, "live_split_2_switch_dropdown_open.png"),
    fullPage: false,
  });
  console.log("Saved live_split_2_switch_dropdown_open.png");

  console.log("4. Selecting Linda Lukstiņa from the dropdown...");
  await page.click("[data-testid='switch-to-linda']");
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(artifactDir, "live_split_3_quick_switch_pin_modal.png"),
    fullPage: false,
  });
  console.log("Saved live_split_3_quick_switch_pin_modal.png");

  console.log("5. Entering Linda's PIN (1111) and confirming switch...");
  const pinInput = page.locator("[data-testid='switch-credential-input']");
  await pinInput.fill("1111");
  await page.click("[data-testid='switch-submit-btn']");
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.join(artifactDir, "live_split_4_switched_to_linda.png"),
    fullPage: false,
  });
  console.log("Saved live_split_4_switched_to_linda.png");

  console.log("6. Clicking on Linda's profile button to verify her personal profile...");
  await page.click("[data-testid='user-profile-button']");
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_split_5_linda_personal_profile.png"),
    fullPage: false,
  });
  console.log("Saved live_split_5_linda_personal_profile.png");

  await browser.close();
  console.log("All split-button and profile tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
