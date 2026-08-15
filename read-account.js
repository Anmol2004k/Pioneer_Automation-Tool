const db = require("./database");
const { decrypt } = require("./crypto");

async function readAccounts() {
  try {
    const sql = `
      SELECT
        id,
        customer_name,
        username,
        password_encrypted,
        is_active
      FROM accounts
      WHERE is_active = 1
    `;

    const [accounts] = await db.execute(sql);

    console.log(`Total Active Accounts: ${accounts.length}\n`);

    for (const account of accounts) {
      const password = decrypt(account.password_encrypted);

      console.log("========================");
      console.log("ID:", account.id);
      console.log("Customer:", account.customer_name);
      console.log("Username:", account.username);
      console.log("Password decrypted successfully:", password ? "YES" : "NO");
      console.log("Active:", account.is_active);
    }

  } catch (error) {
    console.error("❌ Error reading accounts:");
    console.error(error.message);
  } finally {
    process.exit();
  }
}

readAccounts();