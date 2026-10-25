import { chromium } from "playwright";
import path from "path";

const artifactDir = "C:\\Users\\maxeu\\.gemini\\antigravity\\brain\\368cbca8-558d-489f-92b7-64679bfd9bfe";

async function checkOverflow(page: any, viewName: string, containerSelector = "body") {
  const overflows = await page.evaluate((selector: string) => {
    const issues: string[] = [];
    const root = document.querySelector(selector) || document.body;
    const elements = root.querySelectorAll("*");

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (["BODY", "HTML", "svg", "path", "PRE", "CANVAS"].includes(htmlEl.tagName)) return;
      const style = window.getComputedStyle(htmlEl);
      if (style.overflowX === "auto" || style.overflowX === "scroll" || style.overflowY === "auto" || style.overflowY === "scroll") return;
      
      const rect = htmlEl.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return; // not rendered

      // Check if element has horizontal overflow exceeding bounds by more than 3px
      if (htmlEl.scrollWidth > htmlEl.clientWidth + 3 && htmlEl.clientWidth > 0) {
        if (style.textOverflow === "ellipsis" && style.whiteSpace === "nowrap") return;
        const info = `${htmlEl.tagName.toLowerCase()}.${htmlEl.className.slice(0, 40)}: scrollWidth ${htmlEl.scrollWidth} > clientWidth ${htmlEl.clientWidth}`;
        if (!issues.includes(info)) issues.push(info);
      }

      // Check if button text wraps awkwardly or overflows parent
      if (htmlEl.tagName === "BUTTON") {
        const parent = htmlEl.parentElement;
        if (parent) {
          const pRect = parent.getBoundingClientRect();
          if (rect.right > pRect.right + 3 && pRect.width > 0) {
            issues.push(`Button overflows parent: ${htmlEl.innerText.trim().slice(0, 30)} (right: ${Math.round(rect.right)} > parent right: ${Math.round(pRect.right)})`);
          }
        }
      }
    });
    return issues;
  }, containerSelector);

  if (overflows.length > 0) {
    console.log(`[OVERFLOW DETECTED in ${viewName}]:`);
    overflows.forEach((issue: string) => console.log(`  - ${issue}`));
  } else {
    console.log(`[OK] No layout overflow detected in ${viewName}`);
  }
}

async function run() {
  console.log("=== STARTING FULL PLAYWRIGHT VISUAL AUDIT ===");
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  });

  const viewports = [
    { name: "desktop_1440", width: 1440, height: 900 },
    { name: "laptop_1280", width: 1280, height: 800 },
    { name: "tablet_1024", width: 1024, height: 768 }
  ];

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`>>> Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) <<<`);
    console.log(`======================================================`);
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    // 1. /login
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await checkOverflow(page, `Login Page (${vp.name})`);
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_1_login_page.png") });
    }

    // Login as Linda Lukstiņa
    await page.click("text=Linda Lukstiņa");
    await page.waitForURL("http://localhost:3000/", { timeout: 10000 });
    await page.waitForTimeout(1000);

    // 2. Dashboard Kanban
    await checkOverflow(page, `Dashboard Kanban (${vp.name})`, "main");
    await page.screenshot({ path: path.join(artifactDir, `audit_2_dashboard_${vp.name}.png`) });

    // 3. Test UserProfileModal
    console.log("Testing UserProfileModal...");
    await page.click("button[data-testid='user-profile-button']");
    await page.waitForTimeout(600);
    await checkOverflow(page, `UserProfileModal (${vp.name})`, "div.fixed.z-50");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_3_user_profile_modal.png") });
    }
    // Close modal via Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    // 4. Test QuickSwitchModal
    console.log("Testing QuickSwitchModal...");
    await page.click("[data-testid='switch-dropdown-button']");
    await page.waitForTimeout(400);
    const switchTarget = page.locator("[data-testid^='switch-to-']").first();
    if (await switchTarget.count() > 0) {
      await switchTarget.click();
      await page.waitForTimeout(600);
      await checkOverflow(page, `QuickSwitchModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_4_quick_switch_modal.png") });
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 5. Test TagPrintModal (Click QR icon on first card)
    console.log("Testing TagPrintModal...");
    const qrBtn = page.locator("button[title*='Drukāt dāvanas birku ar QR kodu']").first();
    if (await qrBtn.count() > 0) {
      await qrBtn.click();
      await page.waitForTimeout(600);
      await checkOverflow(page, `TagPrintModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_5_tag_print_modal.png") });
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 6. Test ContractModal (Click PDF icon on first card)
    console.log("Testing ContractModal...");
    const pdfBtn = page.locator("button[title*='Apskatīt / Lejupielādēt oficiālo līgumu']").first();
    if (await pdfBtn.count() > 0) {
      await pdfBtn.click();
      await page.waitForTimeout(600);
      await checkOverflow(page, `ContractModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_6_contract_modal.png") });
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 7. Test OrderDetailModal (Click details eye icon or card)
    console.log("Testing OrderDetailModal...");
    const detailEyeBtn = page.locator("button[title*='Skatīt pasūtījuma pilnās detaļas']").first();
    if (await detailEyeBtn.count() > 0) {
      await detailEyeBtn.click();
      await page.waitForTimeout(600);
      await checkOverflow(page, `OrderDetailModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_7_order_detail_modal.png") });
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }

    // 8. Test StatusConfirmModal
    console.log("Testing StatusConfirmModal...");
    const startWrapBtn = page.locator("button:has-text('Sākt iesaiņošanu')").first();
    if (await startWrapBtn.count() > 0) {
      await startWrapBtn.click();
      await page.waitForTimeout(500);
      await checkOverflow(page, `StatusConfirmModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_8_status_confirm_start.png") });
      }
      await page.click("button:has-text('Atcelt')");
      await page.waitForTimeout(500);
    }

    // 9. Test ArchiveModal
    console.log("Testing ArchiveModal...");
    const archiveBtn = page.locator("button:has-text('Arhīvs')").first();
    if (await archiveBtn.count() > 0) {
      await archiveBtn.click();
      await page.waitForTimeout(600);
      await checkOverflow(page, `ArchiveModal (${vp.name})`, "div.fixed.z-50");
      if (vp.name === "desktop_1440") {
        await page.screenshot({ path: path.join(artifactDir, "audit_9_archive_modal.png") });
      }
      await page.click("button:has-text('Aizvērt arhīvu')");
      await page.waitForTimeout(500);
    }

    // 10. Test Table View
    console.log("Testing Table View...");
    await page.click("button:has-text('Saraksts')");
    await page.waitForTimeout(500);
    await checkOverflow(page, `Table View (${vp.name})`, "main");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_10_table_view.png") });
    }
    await page.click("button:has-text('Kanban')");
    await page.waitForTimeout(400);

    // 11. Test New Order Wizard
    console.log("Testing NewOrderWizard...");
    await page.click("button:has-text('Jauns pasūtījums')");
    await page.waitForTimeout(600);
    
    // Step 1
    await checkOverflow(page, `NewOrderWizard Step 1 (${vp.name})`, "div.fixed.z-50");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_11_wizard_step1.png") });
    }
    await page.fill("input[placeholder*='Anna Liepiņa']", "Mārtiņš Kalniņš");
    await page.fill("input[placeholder*='29123456']", "29112233");
    await page.click("button:has-text('Nākamais solis')");
    await page.waitForTimeout(600);

    // Step 2
    await checkOverflow(page, `NewOrderWizard Step 2 (${vp.name})`, "div.fixed.z-50");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_12_wizard_step2.png") });
    }
    await page.click("button:has-text('Nākamais solis')");
    await page.waitForTimeout(600);

    // Step 3
    await checkOverflow(page, `NewOrderWizard Step 3 (${vp.name})`, "div.fixed.z-50");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_13_wizard_step3.png") });
    }
    await page.click("button:has-text('Nākamais solis')");
    await page.waitForTimeout(600);

    // Step 4
    await checkOverflow(page, `NewOrderWizard Step 4 (${vp.name})`, "div.fixed.z-50");
    if (vp.name === "desktop_1440") {
      await page.screenshot({ path: path.join(artifactDir, "audit_14_wizard_step4.png") });
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    await context.close();
  }

  // 12. Also test standalone Contract page
  console.log("\n>>> Testing Standalone Contract Page: /contract/... <<<");
  const contractContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const contractPage = await contractContext.newPage();
  // Fetch an order ID from dev server API
  const ordersRes = await contractPage.request.get("http://localhost:3000/api/orders");
  const ordersData = await ordersRes.json();
  if (ordersData.orders && ordersData.orders.length > 0) {
    const firstId = ordersData.orders[0].id;
    await contractPage.goto(`http://localhost:3000/contract/${firstId}`, { waitUntil: "networkidle" });
    await contractPage.waitForTimeout(500);
    await checkOverflow(contractPage, "Standalone Contract Page");
    await contractPage.screenshot({ path: path.join(artifactDir, "audit_15_contract_page.png") });
  }
  await contractContext.close();

  await browser.close();
  console.log("\n=== FULL PLAYWRIGHT VISUAL AUDIT SUCCESSFULLY COMPLETED ===");
}

run().catch((err) => {
  console.error("Visual audit failed:", err);
  process.exit(1);
});
