const db = require("./database");
const { encrypt } = require("./crypto");

async function addAccount() {
  try {
    const customerName = "AMBER CROP SCIENCE PVT LTD";

    // Apni SAMASTH test login ID yahan temporarily daalo
    const username = "ambercrops@gmail.com";

    // Apna actual password yahan temporarily daalo
    const password = "@Amb2026";

    // Password encrypt karo
    const encryptedPassword = encrypt(password);

    const sql = `
      INSERT INTO accounts
      (
        customer_name,
        username,
        password_encrypted
      )
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      customerName,
      username,
      encryptedPassword
    ]);

    console.log("✅ Account added successfully!");
    console.log("Inserted ID:", result.insertId);

  } catch (error) {
    console.error("❌ Error adding account:");
    console.error(error.message);
  } finally {
    process.exit();
  }
}

addAccount();