const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  console.log("Opening website...");

  await page.goto("https://upc.samasth.io/", {
    waitUntil: "domcontentloaded"
  });

  console.log("Website opened");

  // IMPORTANT:
  // Apni test ID/password yahan temporarily likho.
  // Is file ko kisi ke saath share mat karna.

  const USERNAME = "ambercrops@gmail.com";
  const PASSWORD = "@Amb2026";

  // Page ke saare input fields dekhne ke liye
  console.log("Inputs found:");

  const inputs = await page.locator("input").count();

  for (let i = 0; i < inputs; i++) {
    console.log(
      i,
      await page.locator("input").nth(i).getAttribute("type"),
      await page.locator("input").nth(i).getAttribute("name"),
      await page.locator("input").nth(i).getAttribute("placeholder")
    );
  }

  // Email / username field try
  await page.locator('input[type="email"]').fill(USERNAME);

  // Password field
  await page.locator('input[type="password"]').fill(PASSWORD);

  console.log("Credentials entered");

  // Login button click
 await page.getByRole("button", { name: "Login" }).click();

  console.log("Login button clicked");

  // Dashboard load hone ka wait
  await page.waitForTimeout(5000);

  console.log("Current URL:", page.url());

  // Page ka visible text read karo
  const pageText = await page.locator("body").innerText();

  console.log("\n========================");
  console.log("DASHBOARD DATA");
  console.log("========================\n");

  console.log(pageText);

  // Screenshot save
  await page.screenshot({
    path: "dashboard.png",
    fullPage: true
  });

  console.log("\nScreenshot saved: dashboard.png");

  // Browser abhi open rahega
  console.log("\nAutomation finished.");
}

main().catch(error => {
  console.error("ERROR:", error);
});