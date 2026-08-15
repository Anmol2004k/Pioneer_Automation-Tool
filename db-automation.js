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

  // Har customer ke liye fresh login session
  const context = await browser.newContext();

  const page = await context.newPage();

  try {

    console.log("\n==========================");
    console.log(`Checking: ${account.customer_name}`);
    console.log("==========================");

    // Database password decrypt karo
    const password = decrypt(account.password_encrypted);

    console.log("Password decrypted: YES");

    // Login page
    await page.goto("https://upc.samasth.io/", {
      waitUntil: "domcontentloaded"
    });

    // Email field ka wait
    await page.locator('input[type="email"]').waitFor({
      timeout: 15000
    });

    // Username fill
    await page.locator('input[type="email"]').fill(
      account.username.trim()
    );

    // Password fill
    await page.locator('input[type="password"]').fill(
      password
    );

    console.log("Credentials entered");

    // Login
    await page.getByRole("button", {
      name: "Login"
    }).click();

    // Dashboard wait
    await page.waitForURL(/home/, {
      timeout: 15000
    });

    await page.waitForTimeout(3000);

    console.log("Login successful!");

    // Dashboard text read
    const pageText = await page.locator("body").innerText();

    // Active devices extract
    const activeMatch = pageText.match(
      /(\d+)\s+Active devices/
    );

    const activeDevices = activeMatch
      ? activeMatch[1]
      : "Not Found";

    // Inactive devices extract
    const inactiveMatch = pageText.match(
      /(\d+)\s+Inactive devices/
    );

    const inactiveDevices = inactiveMatch
      ? inactiveMatch[1]
      : "Not Found";

    console.log("Active Devices:", activeDevices);
    console.log("Inactive Devices:", inactiveDevices);

    return {
      accountId: account.id,
      customerName: account.customer_name,
      activeDevices,
      inactiveDevices,
      result: "Success"
    };

  } catch (error) {

    console.log(
      `ERROR for ${account.customer_name}:`,
      error.message
    );

    return {
      accountId: account.id,
      customerName: account.customer_name,
      activeDevices: null,
      inactiveDevices: null,
      result: "Failed"
    };

  } finally {

    await context.close();

  }
}


async function main() {

  try {

    console.log("Reading active accounts from MySQL...");

    const accounts = await getAccounts();

    console.log(`Total Active Accounts: ${accounts.length}`);

    if (accounts.length === 0) {

      console.log("No active accounts found.");
      return;

    }

    // Browser start
    const browser = await chromium.launch({
      headless: false
    });

    const results = [];

    // Har account check karo
    for (const account of accounts) {

      const result = await checkAccount(
        browser,
        account
      );

      results.push(result);

      // Next account se pehle 2 sec delay
      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );
    }

    await browser.close();

    console.log("\n==========================");
    console.log("ALL ACCOUNTS COMPLETED");
    console.log("==========================");

    console.table(results);

  } catch (error) {

    console.error("MAIN ERROR:");
    console.error(error.message);

  } finally {

    process.exit();

  }
}


main();