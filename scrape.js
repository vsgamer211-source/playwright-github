import { chromium } from "playwright";

const url = process.env.TARGET_URL;

if (!url) {
  console.error("No TARGET_URL provided");
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000
  });

  const title = await page.title();

  console.log("Title:", title);

  await browser.close();
})();