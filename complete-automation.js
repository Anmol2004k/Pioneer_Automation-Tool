const { chromium } = require("playwright");

const db = require("./database");
const { decrypt } = require("./crypto");
const { saveDevice } = require("./save-device");
const { saveDeviceLog } = require("./save-device-log");


// ==========================================
// DATABASE SE ACTIVE ACCOUNTS LANA
// ==========================================

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


// ==========================================
// EK ACCOUNT KO CHECK KARNA
// ==========================================

async function checkAccount(browser, account) {

  const context = await browser.newContext();

  const page = await context.newPage();

  try {

    console.log("\n=================================");
    console.log(`Checking: ${account.customer_name}`);
    console.log("=================================");

    // Password decrypt
    const password = decrypt(
      account.password_encrypted
    );

    console.log("Password decrypted: YES");


    // ------------------------------------------
    // SAMASTH LOGIN PAGE OPEN
    // ------------------------------------------

    await page.goto(
      "https://upc.samasth.io/",
      {
        waitUntil: "domcontentloaded"
      }
    );


    // ------------------------------------------
    // LOGIN
    // ------------------------------------------

    await page.locator(
      'input[type="email"]'
    ).waitFor({
      timeout: 15000
    });


    await page
      .locator('input[type="email"]')
      .fill(account.username.trim());


    await page
      .locator('input[type="password"]')
      .fill(password);


    console.log("Credentials entered");


    await page.getByRole("button", {
      name: "Login"
    }).click();


    // Dashboard ka wait
    await page.waitForURL(/home/, {
      timeout: 15000
    });


    await page.waitForTimeout(3000);


    console.log("Login successful!");


    // ==========================================
    // DEVICE DATA EXTRACT
    // ==========================================

    const pageText = await page
      .locator("body")
      .innerText();


    const deviceRegex =
      /([A-Z0-9_-]+)\s+(Active|Inactive)\s+([\d.]+\s*m3\/hr)\s+([\d.]+\s*m3)/g;


    const devices = [];

    let match;


    while (
      (match = deviceRegex.exec(pageText)) !== null
    ) {

      devices.push({
        label: match[1],
        status: match[2],
        flow: match[3],
        total: match[4]
      });

    }


    console.log(
      `Total Devices Found: ${devices.length}`
    );


    // ==========================================
    // HAR DEVICE DATABASE MEIN SAVE KARO
    // ==========================================

    for (const device of devices) {

      console.log(
        `\nProcessing Device: ${device.label}`
      );


      // Latest device data save/update
      const deviceId = await saveDevice(
        account.id,
        device
      );


      // History log save
      await saveDeviceLog(
        deviceId,
        device
      );


      console.log(
        `Completed: ${device.label}`
      );

    }


    return {
      accountId: account.id,
      customerName: account.customer_name,
      devicesFound: devices.length,
      result: "Success"
    };


  } catch (error) {

    console.error(
      `❌ ERROR for ${account.customer_name}:`
    );

    console.error(error.message);


    return {
      accountId: account.id,
      customerName: account.customer_name,
      devicesFound: 0,
      result: "Failed",
      error: error.message
    };


  } finally {

    await context.close();

  }

}


// ==========================================
// MAIN FUNCTION
// ==========================================

async function main() {

  let browser;

  try {

    console.log("\n=================================");
    console.log("SAMASTH AUTOMATION STARTED");
    console.log("=================================\n");


    // Database se accounts
    console.log(
      "Reading active accounts from MySQL..."
    );


    const accounts = await getAccounts();


    console.log(
      `Total Active Accounts: ${accounts.length}`
    );


    if (accounts.length === 0) {

      console.log(
        "No active accounts found."
      );

      return;

    }


    // Browser start
    browser = await chromium.launch({
      headless: false
    });


    const results = [];


    // ==========================================
    // HAR ACCOUNT KO CHECK KARO
    // ==========================================

    for (const account of accounts) {

      const result = await checkAccount(
        browser,
        account
      );


      results.push(result);


      // Next account se pehle 2 second
      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

    }


    // ==========================================
    // FINAL RESULT
    // ==========================================

    console.log("\n=================================");
    console.log("ALL ACCOUNTS COMPLETED");
    console.log("=================================\n");


    console.table(results);


  } catch (error) {

    console.error("\nMAIN ERROR:");

    console.error(error.message);


  } finally {

    if (browser) {

      await browser.close();

    }


    process.exit();

  }

}


main();