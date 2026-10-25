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
  await page.screenshot({
    path: path.join(artifactDir, "live_auth_1_login_page.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_1_login_page.png");

  console.log("2. Logging in as Ieva Kalniņa using demo preset...");
  await page.click("text=Ieva Kalniņa");
  await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_2_dashboard_ieva.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_2_dashboard_ieva.png");

  console.log("3. Opening User Profile Modal via Navbar badge...");
  // Click on the user profile badge in the Navbar
  await page.click("button[title*='Mans profils']");
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_3_profile_modal.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_3_profile_modal.png");

  console.log("4. Switching to 'Pārslēgt Operatoru' tab in modal...");
  await page.click("text=Pārslēgt Operatoru");
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_4_operator_switcher_tab.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_4_operator_switcher_tab.png");

  console.log("5. Selecting Linda Lukstiņa for operator switch...");
  // Find Linda Lukstiņa's card and click 'Pārslēgties'
  const switchBtn = page.locator("div:has-text('Linda Lukstiņa')").locator("button:has-text('Pārslēgties')").first();
  await switchBtn.click();
  await page.waitForTimeout(400);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_5_switch_prompt_linda.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_5_switch_prompt_linda.png");

  console.log("6. Entering Linda's PIN (1111) and confirming switch...");
  const pinInput = page.locator("[data-testid='switch-pin-input']");
  await pinInput.waitFor({ state: "visible", timeout: 5000 });
  await pinInput.fill("1111");
  await page.locator("[data-testid='confirm-switch-btn']").click();
  await page.waitForTimeout(1200);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_6_dashboard_switched_to_linda.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_6_dashboard_switched_to_linda.png");

  console.log("7. Opening Order Details to verify Audit Log with employee identity...");
  // Click on the eye button or order card
  const eyeBtn = page.locator("button[title*='Skatīt pasūtījuma pilnās']").first();
  if (await eyeBtn.isVisible()) {
    await eyeBtn.click();
  } else {
    await page.locator("div.cursor-pointer").first().click();
  }
  await page.waitForTimeout(800);

  // Ritiniet modāļa iekšējo zonu uz leju, lai parādītu personāla audita žurnālu
  const scrollableModal = page.locator("div.overflow-y-auto").last();
  await scrollableModal.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_7_order_audit_trail.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_7_order_audit_trail.png (scrolled to audit log)");

  // Close order details modal
  await page.click("button:has-text('Aizvērt')");
  await page.waitForTimeout(400);

  // Move order #MNL-1052 to 'IESAINOSANA' by clicking 'Sākt iesaiņošanu'
  console.log("8. Changing status to IESAINOSANA under Linda's account...");
  const saktBtn = page.locator("button:has-text('Sākt iesaiņošanu')").first();
  if (await saktBtn.isVisible()) {
    await saktBtn.click();
    await page.waitForTimeout(400);
    // Confirm status change modal
    const confirmBtn = page.locator("button:has-text('Jā, sākt iesaiņošanu')");
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Open the order details again to see the new Linda Lukstiņa audit entry!
  const orderAfterStatus = page.locator("div:has-text('#MNL-1052')").locator("button[title*='Skatīt pasūtījuma pilnās']").first();
  if (await orderAfterStatus.isVisible()) {
    await orderAfterStatus.click();
  } else {
    await page.locator("div:has-text('#MNL-1052')").first().click();
  }
  await page.waitForTimeout(600);

  const scrollableModal2 = page.locator("div.overflow-y-auto").last();
  await scrollableModal2.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(artifactDir, "live_auth_8_order_audit_linda_action.png"),
    fullPage: false,
  });
  console.log("Saved live_auth_8_order_audit_linda_action.png");

  await browser.close();
  console.log("All tests completed successfully!");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
