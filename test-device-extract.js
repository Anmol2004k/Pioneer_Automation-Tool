const { chromium } = require("playwright");

const db = require("./database");
const { decrypt } = require("./crypto");

async function getAccounts() {
  const [accounts] = await db.execute(`
    SELECT
      id,
      customer_name,
      username,
      password_encrypted
    FROM accounts
    WHERE is_active = 1
  `);

  return accounts;
}

async function checkAccount(browser, account) {
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`\nChecking: ${account.customer_name}`);

    // Password database se decrypt
    const password = decrypt(account.password_encrypted);

    // Login page
    await page.goto("https://upc.samasth.io/", {
      waitUntil: "domcontentloaded"
    });

    // Login
    await page.locator('input[type="email"]').waitFor({
      timeout: 15000
    });

    await page
      .locator('input[type="email"]')
      .fill(account.username.trim());

    await page
      .locator('input[type="password"]')
      .fill(password);

    await page.getByRole("button", {
      name: "Login"
    }).click();

    // Dashboard wait
    await page.waitForURL(/home/, {
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log("Login successful!");

    // Pura dashboard text
    const pageText = await page.locator("body").innerText();

    console.log("\n===== RAW DASHBOARD TEXT =====\n");

    console.log(pageText);

    console.log("\n===== DEVICE DATA TEST =====\n");

    /*
      Screenshot/output ke according device format:

      USFL_UPCF156    Active    0.00 m3/hr    7361.18 m3

      Isliye pehle simple regex test kar rahe hain.
    */

    const deviceRegex =
      /([A-Z0-9_-]+)\s+(Active|Inactive)\s+([\d.]+\s*m3\/hr)\s+([\d.]+\s*m3)/g;

    const devices = [];

    let match;

    while ((match = deviceRegex.exec(pageText)) !== null) {
      devices.push({
        label: match[1],
        status: match[2],
        flow: match[3],
        total: match[4]
      });
    }

    console.log("Extracted Devices:");

    console.table(devices);

    return devices;

  } catch (error) {
    console.error("ERROR:", error.message);

    return [];

  } finally {
    await context.close();
  }
}

async function main() {
  try {
    const accounts = await getAccounts();

    console.log(`Total Accounts: ${accounts.length}`);

    if (accounts.length === 0) {
      console.log("No active accounts found.");
      return;
    }

    const browser = await chromium.launch({
      headless: false
    });

    // Abhi sirf first account test karenge
    const account = accounts[0];

    const devices = await checkAccount(
      browser,
      account
    );

    await browser.close();

    console.log("\nFINAL EXTRACTED DATA:");

    console.log(JSON.stringify(devices, null, 2));

  } catch (error) {
    console.error("MAIN ERROR:", error.message);
  } finally {
    process.exit();
  }
}

main();