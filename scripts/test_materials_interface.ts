import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/maxeu/AppData/Local/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-win64/chrome-headless-shell.exe"
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  const page = await context.newPage();

  console.log("Navigating to home page...");
  await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  // If redirected to login, log in as Ieva
  if (page.url().includes("/login")) {
    console.log("On login page, logging in as Ieva...");
    await page.locator('button:has-text("Ieva Kalniņa")').click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });
    await page.waitForTimeout(1000);
  }

  // Find order card #MNL-1048 (from user screenshot) or the first card with materials
  console.log("Looking for order card #MNL-1048...");
  const card1048 = page.locator('text=#MNL-1048').first();
  if (await card1048.isVisible()) {
    await card1048.click();
  } else {
    // Click any visible order card
    console.log("#MNL-1048 not directly visible in current column, clicking first available order card...");
    await page.locator('[data-testid^="order-card-"]').first().click();
  }

  await page.waitForTimeout(800);

  // In the Order Detail modal, take screenshot of the gift card preview showing product codes
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_detail_modal_with_codes.png",
  });

  // Now click to open the full materials modal (either "Meistara darba lapa & svītrkodi" or the materials block)
  console.log("Opening full materials modal...");
  const openModalBtn = page.locator('text=Meistara darba lapa & svītrkodi').first();
  if (await openModalBtn.isVisible()) {
    await openModalBtn.click();
  } else {
    await page.locator('text=Atvērt pilnu specifikāciju').first().click();
  }

  await page.waitForTimeout(800);

  // Verify that ART codes and barcodes are visible
  const hasArtCode = await page.locator('text=ART:').first().isVisible();
  console.log("Is ART code visible:", hasArtCode);
  if (!hasArtCode) {
    throw new Error("Product ART code is not visible!");
  }

  const hasBarcodeDigits = await page.locator('text=475001').first().isVisible();
  console.log("Are Barcode digits visible:", hasBarcodeDigits);

  // Test interactive picking checklist: click "Atzīmēt" on the first row
  console.log("Testing picking toggle...");
  const firstPickBtn = page.locator('button:has-text("Atzīmēt")').first();
  if (await firstPickBtn.isVisible()) {
    await firstPickBtn.click();
    await page.waitForTimeout(300);
    const hasPicked = await page.locator('text=Paņemts').first().isVisible();
    console.log("Did it toggle to 'Paņemts':", hasPicked);
  }

  // Take screenshot of the enhanced workshop materials modal
  await page.screenshot({
    path: "C:/Users/maxeu/.gemini/antigravity/brain/368cbca8-558d-489f-92b7-64679bfd9bfe/verified_materials_crafter_interface.png",
  });

  console.log("SUCCESS! Screenshot saved to verified_materials_crafter_interface.png");
  await browser.close();
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
