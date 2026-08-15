const { chromium } = require("playwright");
const XLSX = require("xlsx");

async function checkAccount(browser, account) {

  // Har account ke liye fresh session
  const context = await browser.newContext();

  const page = await context.newPage();

  try {

    // Excel values clean karo
    const customer = String(account.Customer || "").trim();
    const username = String(account.Username || "").trim();
    const password = String(account.Password || "").trim();

    console.log(`\nChecking: ${customer}`);
    console.log(`Username: ${username}`);

    // Login page open
    await page.goto("https://upc.samasth.io/", {
      waitUntil: "domcontentloaded"
    });

    // Email field ka wait
    await page.locator('input[type="email"]').waitFor({
      timeout: 15000
    });

    // Username fill
    await page.locator('input[type="email"]').fill(username);

    // Password fill
    await page.locator('input[type="password"]').fill(password);

    console.log("Credentials entered");

    // Login click
    await page.getByRole("button", {
      name: "Login"
    }).click();

    console.log("Login button clicked");

    // Dashboard ka wait
    await page.waitForURL(/home/, {
      timeout: 15000
    });

    // Dashboard load hone do
    await page.waitForTimeout(3000);

    console.log("Login successful!");

    // Dashboard text read
    const pageText = await page.locator("body").innerText();

    // Active devices
    const activeMatch = pageText.match(
      /(\d+)\s+Active devices/
    );

    const activeDevices = activeMatch
      ? activeMatch[1]
      : "Not Found";

    // Inactive devices
    const inactiveMatch = pageText.match(
      /(\d+)\s+Inactive devices/
    );

    const inactiveDevices = inactiveMatch
      ? inactiveMatch[1]
      : "Not Found";

    console.log("Active:", activeDevices);
    console.log("Inactive:", inactiveDevices);

    return {
      Customer: customer,
      Username: username,
      ActiveDevices: activeDevices,
      InactiveDevices: inactiveDevices,
      Result: "Success",
      CheckedAt: new Date().toLocaleString()
    };

  } catch (error) {

    console.log(
      `ERROR for ${account.Customer}:`,
      error.message
    );

    return {
      Customer: String(account.Customer || "").trim(),
      Username: String(account.Username || "").trim(),
      ActiveDevices: "",
      InactiveDevices: "",
      Result: "Failed",
      Error: error.message.substring(0, 150),
      CheckedAt: new Date().toLocaleString()
    };

  } finally {

    // Is account ka session delete/close
    await context.close();

    console.log("Session closed");
  }
}


async function main() {

  console.log("Reading Excel file...");

  // Excel read
  const workbook = XLSX.readFile("accounts.xlsx");

  const sheetName = workbook.SheetNames[0];

  const worksheet = workbook.Sheets[sheetName];

  const accounts = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Total Accounts: ${accounts.length}`);

  // Browser start
  const browser = await chromium.launch({
    headless: false
  });

  const results = [];

  // Har account ko check karo
  for (const account of accounts) {

    console.log("\n==========================");
    console.log(`Checking ${account.Customer}`);
    console.log("==========================");

    const result = await checkAccount(browser, account);

    results.push(result);

    // Next account se pehle 2 sec wait
    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );
  }

  // Browser close
  await browser.close();

  console.log("\n==========================");
  console.log("ALL ACCOUNTS COMPLETED");
  console.log("==========================");

  console.table(results);

  // Result Excel create
  const resultWorkbook = XLSX.utils.book_new();

  const resultWorksheet =
    XLSX.utils.json_to_sheet(results);

  XLSX.utils.book_append_sheet(
    resultWorkbook,
    resultWorksheet,
    "Results"
  );

  XLSX.writeFile(
    resultWorkbook,
    "results.xlsx"
  );

  console.log("\nResults saved in: results.xlsx");
}


main().catch(error => {
  console.error("MAIN ERROR:", error);
});