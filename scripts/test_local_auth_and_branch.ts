import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/maxeu/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("--- 1. Testing Single User Login (Ieva Kalniņa - Tērbatas iela 55) ---");
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.text()));
  page.on('pageerror', err => console.log('[PAGE ERROR]', err.message));

  console.log("Navigating to /login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  console.log("Loaded /login. Current URL:", page.url());

  // Clear localStorage so we start fresh on this device
  await page.evaluate(() => localStorage.clear());
  console.log("Cleared localStorage. Reloading...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  console.log("Clicking quick preset for Ieva...");
  await page.locator('button:has-text("Ieva Kalniņa")').click();
  console.log("Clicked! Waiting for navigation...");
  await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
  console.log("Navigated to root! Waiting 1s...");
  await page.waitForTimeout(1000);

  // 1a. Check Branch Selector automatically selected Tērbatas iela 55
  const branchButtonText = await page.locator('button[data-testid="branch-selector-button"]').innerText();
  console.log("Active Branch Text:", branchButtonText);
  if (!branchButtonText.includes("Tērbatas iela 55")) {
    throw new Error(`Expected Tērbatas iela 55, got: ${branchButtonText}`);
  }
  console.log("✓ Branch automatically selected: Tērbatas iela 55");

  // 1b. Open switch dropdown - should have NO other local operators yet!
  await page.click('button[data-testid="switch-dropdown-button"]');
  await page.waitForTimeout(500);

  const hasEmptyNotice = await page.locator('text=Nav citu saglabātu profilu').isVisible();
  console.log("Empty notice visible when no other local users:", hasEmptyNotice);
  if (!hasEmptyNotice) {
    throw new Error("Expected empty notice when no other users logged into this device!");
  }
  console.log("✓ No users leaked from database! Switch list is 100% device-local.");

  // Check the "Pievienot profilu šai ierīcei" button
  const addProfileBtn = page.locator('button[data-testid="add-profile-to-device-btn"]');
  const hasAddProfileBtn = await addProfileBtn.isVisible();
  console.log("Has 'Pievienot profilu šai ierīcei' button:", hasAddProfileBtn);

  // Take screenshot 1: Single user with empty local switch dropdown
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_local_switch_empty.png",
  });

  // 2. Click "Pievienot profilu šai ierīcei" to log in second operator (Marta Liepiņa)
  console.log("--- 2. Adding second operator (Marta Liepiņa - Galerija Centrs) ---");
  await addProfileBtn.click();
  await page.waitForURL((url) => url.pathname === "/login", { timeout: 10000 });
  await page.waitForTimeout(500);

  // Click quick preset for Marta Liepiņa
  console.log("Clicking quick preset for Marta Liepiņa...");
  await page.locator('button:has-text("Marta Liepiņa")').click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
  await page.waitForTimeout(1000);

  // 2a. Check Branch Selector automatically updated to T/C Galerija Centrs
  const martaBranchText = await page.locator('button[data-testid="branch-selector-button"]').innerText();
  console.log("Marta Active Branch Text:", martaBranchText);
  if (!martaBranchText.includes("Galerija Centrs")) {
    throw new Error(`Expected Galerija Centrs, got: ${martaBranchText}`);
  }
  console.log("✓ Branch automatically switched to: T/C Galerija Centrs");

  // 2b. Now open switch dropdown - should show Ieva Kalniņa as locally saved!
  await page.click('button[data-testid="switch-dropdown-button"]');
  await page.waitForTimeout(500);

  const ievaOption = page.locator('button[data-testid="switch-to-ieva"]');
  const hasIeva = await ievaOption.isVisible();
  console.log("Ieva Kalniņa visible in local switcher:", hasIeva);
  if (!hasIeva) {
    throw new Error("Expected Ieva Kalniņa to be available for local switch!");
  }

  // Linda Lukstiņa was NEVER logged into this device, so she MUST NOT appear in the list!
  const hasLinda = await page.locator('button[data-testid="switch-to-linda"]').isVisible();
  console.log("Linda Lukstiņa visible in local switcher (should be FALSE):", hasLinda);
  if (hasLinda) {
    throw new Error("CRITICAL SECURITY FLAW: Linda appeared in local switch without logging into this device!");
  }
  console.log("✓ STRICT LOCAL ISOLATION VERIFIED: Only locally logged-in users appear in switcher.");

  // Take screenshot 2: Marta active, Ieva in local switch list
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_local_switch_two_users.png",
  });

  // 3. Test quick switch from Marta to Ieva using PIN (2222)
  console.log("--- 3. Testing quick switch to Ieva with PIN ---");
  await ievaOption.click();
  await page.waitForTimeout(500);

  // Quick switch modal should be open
  const pinInput = page.locator('input[placeholder*="PIN"]');
  await pinInput.fill("2222");
  await page.click('button:has-text("Apstiprināt & Pārslēgt")');
  await page.waitForTimeout(1000);

  // Check branch auto-switched back to Tērbatas iela 55!
  const switchedBranchText = await page.locator('button[data-testid="branch-selector-button"]').innerText();
  console.log("Post-switch Active Branch Text:", switchedBranchText);
  if (!switchedBranchText.includes("Tērbatas iela 55")) {
    throw new Error(`Expected Tērbatas iela 55 after switch, got: ${switchedBranchText}`);
  }
  console.log("✓ Branch automatically restored to Tērbatas iela 55 after switching back to Ieva!");

  // Take screenshot 3: Back to Ieva
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_switched_back_to_ieva.png",
  });

  console.log("ALL TESTS PASSED WITH 100% SUCCESS!");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
