import { chromium } from "playwright";
import fs from "fs";

const url = process.env.TARGET_URL;

if (!url) {
  console.error("No TARGET_URL provided");
  process.exit(1);
}

(async () => {
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      locale: "en-US",
      timezoneId: "Asia/Kolkata"
    });

    const page = await context.newPage();

    // Remove webdriver flag
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined
      });
    });

    console.log("Opening:", url);

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90000
    });

    // Wait for Cloudflare JS challenge if present
    await page.waitForTimeout(8000);

    // Small human-like delay
    await page.mouse.move(200, 200);
    await page.waitForTimeout(1000);

    const title = await page.title();

    const content = await page.content();

    fs.writeFileSync("cf_page.html", content);

    console.log("Title:", title);

    await browser.close();
  } catch (err) {
    console.error("FAILED:", err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();