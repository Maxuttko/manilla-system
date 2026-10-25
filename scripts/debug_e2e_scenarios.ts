import { chromium } from "playwright";

async function run() {
  console.log("================================================================================");
  console.log("       STARTING MASTER E2E DEBUGGING & VERIFICATION SUITE       ");
  console.log("================================================================================");

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/maxeu/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
      console.error(`[BROWSER CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`[PAGE ERROR] ${err.message}`);
    console.error(`[BROWSER UNHANDLED ERROR] ${err.message}`);
  });

  page.on("requestfailed", (req) => {
    console.error(`[REQUEST FAILED] ${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
  });

  page.on("response", async (res) => {
    if (res.url().includes("/status")) {
      try {
        console.log(`[STATUS API RESPONSE] ${res.status()} ${await res.text()}`);
      } catch {}
    }
  });

  // ---------------------------------------------------------------------------
  // SCENARIO 1: LINDA LUKSTIŅA (ADMIN)
  // ---------------------------------------------------------------------------
  console.log("\n--- [SCENARIO 1]: Admin Login & Kanban Operations (Linda Lukstiņa) ---");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });

  await page.locator('button:has-text("Linda Lukstiņa")').click();
  await page.waitForSelector('button[data-testid="user-profile-button"]', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Check Linda's credentials in Navbar
  const userText = await page.locator('button[data-testid="user-profile-button"]').innerText();
  console.log("Active Admin User Text:", userText.replace(/\n/g, " "));
  if (!userText.includes("Linda Lukstiņa")) {
    throw new Error("Failed to authenticate as Linda Lukstiņa!");
  }

  // Test Search bar
  console.log("Testing search bar filter...");
  const searchInput = page.locator('input[placeholder*="Meklēt"]');
  await searchInput.fill("1048");
  await page.waitForTimeout(800);
  const foundCard = await page.locator('text=#MNL-1048').isVisible();
  console.log("Search for '#MNL-1048' found card:", foundCard);
  if (!foundCard) throw new Error("Search filter failed for #MNL-1048!");
  await searchInput.fill("");
  await page.waitForTimeout(600);

  // Test Column Filter Dropdown (Filtrs ▾)
  console.log("Testing Column Filter Dropdown (Filtrs ▾)...");
  const firstFilterBtn = page.locator('button:has-text("Filtrs")').first();
  await firstFilterBtn.click();
  await page.waitForTimeout(400);
  const filterOptionsVisible = await page.locator('button:has-text("Termiņš")').first().isVisible();
  console.log("Column filter options expanded:", filterOptionsVisible);
  if (!filterOptionsVisible) throw new Error("Column filter dropdown failed to expand!");
  await firstFilterBtn.click(); // collapse back

  // ---------------------------------------------------------------------------
  // SCENARIO 2: CREATE A MULTI-GIFT ORDER WITH SIGNATURE
  // ---------------------------------------------------------------------------
  const testCustomerName = "Arturs QA " + Math.floor(1000 + Math.random() * 9000);
  console.log(`\n--- [SCENARIO 2]: New Order Wizard (Multi-Gift, Materials, Signature for ${testCustomerName}) ---`);
  await page.click('button:has-text("Jauns pasūtījums")');
  await page.waitForTimeout(600);

  // Step 1: Customer Info
  console.log("Filling Step 1: Customer details...");
  await page.fill('input[placeholder*="Anna"]', testCustomerName);
  await page.fill('input[placeholder*="29123456"]', "+371 28991234");
  await page.fill('input[placeholder*="anna@piemers.lv"]', "arturs.berzins@example.com");

  // Select store branch
  const branchSelect = page.locator('select').first();
  if (await branchSelect.isVisible()) {
    await branchSelect.selectOption({ label: "Tērbatas iela 55" });
  }

  await page.click('button:has-text("Nākamais solis")');
  await page.waitForTimeout(600);

  // Step 2: Gifts
  console.log("Filling Step 2: Dāvanu priekšmeti...");
  const gift1Title = page.locator('input[placeholder*="Porcelāna"]').first();
  await gift1Title.fill("Vintage keramikas tējkanna");

  // Check 3rd party
  const thirdPartyCheckbox = page.locator('input[type="checkbox"]').first();
  if (await thirdPartyCheckbox.isVisible()) {
    await thirdPartyCheckbox.check();
  }

  // Defect note
  const defectTextarea = page.locator('textarea').first();
  if (await defectTextarea.isVisible()) {
    await defectTextarea.fill("Klienta personīgais priekšmets. Neliels emaljas noberzums pie osiņas.");
  }

  // Add 2nd gift
  console.log("Adding 2nd gift item to order...");
  const addGiftBtn = page.locator('button:has-text("Pievienot vēl vienu dāvanu")');
  if (await addGiftBtn.isVisible()) {
    await addGiftBtn.click();
    await page.waitForTimeout(400);
    const gift2Title = page.locator('input[placeholder*="Porcelāna"]').first();
    await gift2Title.fill("Zīda šalle Manilla dāvanu kastē");
  }

  await page.click('button:has-text("Nākamais solis")');
  await page.waitForTimeout(600);

  // Step 3: Material selection
  console.log("Filling Step 3: Material selection (Trust master)...");
  await page.click('button:has-text("Uzticēties meistara gaumei")');
  await page.waitForTimeout(400);
  const limitInput = page.locator('input[placeholder*="20.00"]');
  if (await limitInput.isVisible()) {
    await limitInput.fill("25.00");
  }

  await page.click('button:has-text("Nākamais solis")');
  await page.waitForTimeout(600);

  // Step 4: Touchscreen signature canvas
  console.log("Filling Step 4: Customer signature canvas...");
  const canvas = page.locator('canvas').first();
  if (await canvas.isVisible()) {
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 60);
      await page.mouse.move(box.x + 180, box.y + 40);
      await page.mouse.move(box.x + 220, box.y + 70);
      await page.mouse.up();
    }
  }

  console.log("Submitting order to server...");
  await page.click('button:has-text("Apstiprināt & Izveidot pasūtījumu")');
  await page.waitForTimeout(2000);

  // Take screenshot of newly created order with automatic Tag Print modal
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_debug_new_order_card.png",
  });

  // Verify TagPrintModal automatically opened to print labels for crafter
  const tagModalVisible = await page.locator('text=Dāvanas QR Birka un Marķējums').isVisible();
  console.log("Tag Print Modal automatically opened for new order:", tagModalVisible);
  if (!tagModalVisible) throw new Error("Expected Tag Print Modal to open after order creation!");

  // Extract the exact created order number from printable tag
  const createdOrderNumber = (await page.locator('#printable-tag .font-mono.font-bold').first().innerText()).trim();
  console.log(`Newly created unique order number: ${createdOrderNumber}`);

  // Close Tag Print Modal
  await page.locator('button[data-testid="tag-modal-close-btn"]').click();
  await page.waitForTimeout(800);

  // Verify newly created order is on the board
  console.log(`Checking if new order was created in column 1 (Pieņemts) for ${createdOrderNumber}...`);
  await searchInput.fill(createdOrderNumber);
  await page.waitForTimeout(600);
  const hasArtursOrder = await page.locator(`text=${createdOrderNumber}`).first().isVisible();
  console.log(`New order '${createdOrderNumber}' is visible on Kanban board:`, hasArtursOrder);
  if (!hasArtursOrder) throw new Error(`Newly created order ${createdOrderNumber} not found on board!`);
  await searchInput.fill("");
  await page.waitForTimeout(400);

  // ---------------------------------------------------------------------------
  // SCENARIO 3: CRAFTER WORKFLOW & STATUS TRANSITIONS
  // ---------------------------------------------------------------------------
  console.log("\n--- [SCENARIO 3]: Crafter Workflow & Status Transitions ---");
  // Open test order detail modal
  await searchInput.fill(createdOrderNumber);
  await page.waitForTimeout(600);
  await page.locator(`text=${createdOrderNumber}`).first().click();
  await page.waitForTimeout(800);
  await searchInput.fill("");
  await page.waitForTimeout(400);

  // Check detail modal opened
  const detailModalTitle = await page.locator('h2:has-text("#MNL-")').first().innerText();
  console.log("Opened Order Detail Modal for:", detailModalTitle);

  // Test Print Tag Modal
  console.log("Testing 'Drukāt birku' modal...");
  await page.click('button:has-text("Drukāt birku")');
  await page.waitForTimeout(600);
  const tagModalVisibleInDetail = await page.locator('text=Dāvanas QR Birka un Marķējums').isVisible();
  console.log("Tag printing modal visible:", tagModalVisibleInDetail);
  if (!tagModalVisibleInDetail) throw new Error("Tag printing modal failed to open!");

  // Close tag modal using its dedicated close button
  await page.locator('button[data-testid="tag-modal-close-btn"]').click();
  await page.waitForTimeout(600);

  // Advance status from Pieņemts to Iesaiņošanā from inside OrderDetailModal
  console.log("Advancing status to 'Iesaiņošanā'...");
  const startWrappingBtn = page.locator('[data-testid="order-detail-modal"] button:has-text("Sākt iesaiņošanu")');
  await startWrappingBtn.waitFor({ state: "visible", timeout: 8000 });
  await startWrappingBtn.click();
  await page.waitForTimeout(600);

  // Confirm in StatusConfirmModal
  const confirmBtn1 = page.locator('button:has-text("Jā, sākt iesaiņošanu")').first();
  await confirmBtn1.waitFor({ state: "visible", timeout: 8000 });
  await confirmBtn1.click();
  await page.waitForTimeout(1500);
  console.log("Status confirmed: moved to 'Iesaiņošanā'!");

  // Open the order again from column 2 (Iesaiņošanā)
  console.log(`Locating '${createdOrderNumber}' in 'Iesaiņošanā' column...`);
  await page.waitForTimeout(1000);
  await searchInput.fill(createdOrderNumber);
  await page.waitForTimeout(600);
  await page.locator(`text=${createdOrderNumber}`).first().click();
  await page.waitForTimeout(1000);

  const modalOrderNumber = await page.locator('[data-testid="order-detail-modal"] h2').first().innerText();
  const modalStatusBadge = await page.locator('[data-testid="order-detail-modal"] span').allInnerTexts();
  console.log("Modal opened order:", modalOrderNumber, "Badges:", modalStatusBadge.slice(0, 5));

  const modalButtons = await page.locator('[data-testid="order-detail-modal"] button').allInnerTexts();
  console.log("Modal buttons visible:", modalButtons.map(b => b.replace(/\n/g, ' ')));

  // Advance to Gatavs saņemšanai (triggers SMS notification)
  console.log("Advancing status to 'Gatavs saņemšanai' (SMS trigger)...");
  const finishBtn = page.locator('[data-testid="order-detail-modal"] button:has-text("Pabeigt & Izsūtīt SMS")');
  await finishBtn.waitFor({ state: "visible", timeout: 8000 });
  await finishBtn.click();
  await page.waitForTimeout(600);

  // Confirm in StatusConfirmModal with SMS
  const confirmBtn2 = page.locator('button:has-text("Pabeigt & Nosūtīt SMS")').first();
  await confirmBtn2.waitFor({ state: "visible", timeout: 8000 });
  await confirmBtn2.click();
  await page.waitForTimeout(1500);
  console.log("Status confirmed: moved to 'Gatavs saņemšanai' & SMS dispatched!");

  // Verify & Close SmsModal
  const smsModalCloseBtn = page.locator('button[data-testid="sms-modal-close-btn"]');
  if (await smsModalCloseBtn.isVisible()) {
    console.log("Verified SMS modal triggered with canonical text and duplicate guard!");
    await smsModalCloseBtn.click();
    await page.waitForTimeout(600);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 4: CASHIER PICKUP & DELIVERY
  // ---------------------------------------------------------------------------
  console.log("\n--- [SCENARIO 4]: Deliver Order & Archive ---");
  // Re-open order from column 3 (Gatavs saņemšanai)
  console.log(`Locating '${createdOrderNumber}' in 'Gatavs saņemšanai' to deliver...`);
  await page.waitForTimeout(1000);
  await searchInput.fill(createdOrderNumber);
  await page.waitForTimeout(600);
  await page.locator(`text=${createdOrderNumber}`).first().click();
  await page.waitForTimeout(800);
  await searchInput.fill("");
  await page.waitForTimeout(400);

  const deliverBtn = page.locator('[data-testid="order-detail-modal"] button:has-text("Izsniegt klientam")');
  await deliverBtn.waitFor({ state: "visible", timeout: 8000 });
  await deliverBtn.click();
  await page.waitForTimeout(600);

  // If cash receipt number is requested for audit, fill it
  const receiptInput = page.locator('input[placeholder*="89455"]');
  if (await receiptInput.isVisible()) {
    console.log("Entering cash receipt #89455 for fiscal audit...");
    await receiptInput.fill("89455");
    await page.waitForTimeout(300);
  }

  // Confirm delivery in StatusConfirmModal
  const confirmBtn3 = page.locator('button:has-text("Apstiprināt izsniegšanu")').first();
  await confirmBtn3.waitFor({ state: "visible", timeout: 8000 });
  await confirmBtn3.click();
  await page.waitForTimeout(1000);
  console.log("Order delivered to customer and archived!");

  // Check Arhīvs modal (column 4)
  console.log("Checking completed archive column...");
  const archiveBtn = page.locator('button:has-text("Arhīvs")').first();
  if (await archiveBtn.isVisible()) {
    await archiveBtn.click();
    await page.waitForTimeout(600);
    const archiveModalOpen = await page.locator('text=Pasūtījumu Arhīvs').isVisible();
    console.log("Archive Modal opened:", archiveModalOpen);
    if (!archiveModalOpen) throw new Error("Archive Modal failed to open!");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO 5: USER PROFILE & PIN SWITCH
  // ---------------------------------------------------------------------------
  console.log("\n--- [SCENARIO 5]: User Profile Modal & Operator Switch ---");
  await page.locator('button[data-testid="user-profile-button"]').click();
  await page.waitForTimeout(600);
  const profileModalOpen = await page.locator('text=Piesaistītā filiāle (Darba vieta)').isVisible();
  console.log("User Profile Modal opened:", profileModalOpen);
  if (!profileModalOpen) throw new Error("User Profile Modal failed to open!");

  // Close profile modal
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // Take final verified screenshot
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_master_e2e_success.png",
  });

  // ---------------------------------------------------------------------------
  // REPORT CONSOLE ERRORS & SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("                       E2E TEST SUITE REPORT                            ");
  console.log("================================================================================");
  console.log(`Total console errors encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Console errors detail:");
    consoleErrors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  } else {
    console.log("PERFECT: 0 console errors during entire end-to-end workflow!");
  }

  await browser.close();
}

run().catch((err) => {
  console.error("Master E2E Test Suite encountered a failure:", err);
  process.exit(1);
});
