const express = require("express");
const cors = require("cors");

const { getDashboardSummary } =
  require("./dashboard-summary");

const { getCompanySummary } =
  require("./company-summary");

const db = require("./database");


const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// HOME / API STATUS
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "SAMASTH Monitoring API is running"
  });
});


// ==========================================
// DASHBOARD SUMMARY
// ==========================================

app.get("/api/dashboard", async (req, res) => {

  try {

    const summary =
      await getDashboardSummary();

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary"
    });

  }

});


// ==========================================
// ALL COMPANIES SUMMARY
// ==========================================

app.get("/api/companies", async (req, res) => {

  try {

    const companies =
      await getCompanySummary();

    res.json({
      success: true,
      total: companies.length,
      data: companies
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load companies"
    });

  }

});


// ==========================================
// SINGLE COMPANY DEVICES
// ==========================================

app.get(
  "/api/companies/:id/devices",
  async (req, res) => {

    try {

      const accountId = req.params.id;

      const [devices] =
        await db.execute(
          `
          SELECT
            id,
            device_label,
            current_status,
            current_flow,
            current_total,
            last_checked

          FROM devices

          WHERE account_id = ?

          ORDER BY
            current_status ASC,
            device_label ASC
          `,
          [accountId]
        );


      res.json({
        success: true,
        accountId,
        totalDevices: devices.length,
        data: devices
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to load devices"
      });

    }

  }
);

// ==========================================
// ACCOUNT MANAGEMENT
// ==========================================

// ADD NEW ACCOUNT
app.post("/api/accounts", async (req, res) => {

  try {

    const { customer_name, username, password } = req.body;

    // Validate input
    if (!customer_name || !username || !password) {

      return res.status(400).json({
        success: false,
        message: "customer_name, username and password are required"
      });

    }

    // Check duplicate username
    const [existing] = await db.execute(
      `
      SELECT id
      FROM accounts
      WHERE username = ?
      `,
      [username]
    );

    if (existing.length > 0) {

      return res.status(409).json({
        success: false,
        message: "An account with this username already exists"
      });

    }

    // Encrypt password
    const { encrypt } = require("./crypto");

    const encryptedPassword = encrypt(password);

    // Insert account
    const [result] = await db.execute(
      `
      INSERT INTO accounts
      (
        customer_name,
        username,
        password_encrypted,
        is_active
      )
      VALUES (?, ?, ?, 1)
      `,
      [
        customer_name,
        username,
        encryptedPassword
      ]
    );

    res.status(201).json({

      success: true,

      message: "Account added successfully",

      data: {
        id: result.insertId,
        customer_name,
        username,
        is_active: true
      }

    });

  } catch (error) {

    console.error("Add account error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add account"
    });

  }

});


// GET ALL ACCOUNTS
app.get("/api/accounts", async (req, res) => {

  try {

    const [accounts] = await db.execute(
      `
      SELECT
        id,
        customer_name,
        username,
        is_active,
        created_at,
        updated_at

      FROM accounts

      ORDER BY customer_name ASC
      `
    );

    res.json({

      success: true,

      total: accounts.length,

      data: accounts

    });

  } catch (error) {

    console.error("Get accounts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load accounts"
    });

  }

});


// UPDATE ACCOUNT
app.put("/api/accounts/:id", async (req, res) => {

  try {

    const accountId = req.params.id;

    const {
      customer_name,
      username,
      password
    } = req.body;


    if (!customer_name || !username) {

      return res.status(400).json({
        success: false,
        message: "customer_name and username are required"
      });

    }


    // Check account exists
    const [account] = await db.execute(
      `
      SELECT id
      FROM accounts
      WHERE id = ?
      `,
      [accountId]
    );


    if (account.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Account not found"
      });

    }


    // Check username belongs to another account
    const [duplicate] = await db.execute(
      `
      SELECT id
      FROM accounts
      WHERE username = ?
      AND id != ?
      `,
      [
        username,
        accountId
      ]
    );


    if (duplicate.length > 0) {

      return res.status(409).json({
        success: false,
        message: "Another account already uses this username"
      });

    }


    // If password provided → encrypt new password
    if (password) {

      const { encrypt } = require("./crypto");

      const encryptedPassword = encrypt(password);

      await db.execute(
        `
        UPDATE accounts

        SET
          customer_name = ?,
          username = ?,
          password_encrypted = ?

        WHERE id = ?
        `,
        [
          customer_name,
          username,
          encryptedPassword,
          accountId
        ]
      );

    } else {

      // Keep existing password
      await db.execute(
        `
        UPDATE accounts

        SET
          customer_name = ?,
          username = ?

        WHERE id = ?
        `,
        [
          customer_name,
          username,
          accountId
        ]
      );

    }


    res.json({

      success: true,

      message: "Account updated successfully"

    });

  } catch (error) {

    console.error("Update account error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update account"
    });

  }

});


// ENABLE / DISABLE ACCOUNT
app.patch("/api/accounts/:id/status", async (req, res) => {

  try {

    const accountId = req.params.id;

    const { is_active } = req.body;


    if (
      typeof is_active !== "boolean" &&
      is_active !== 0 &&
      is_active !== 1
    ) {

      return res.status(400).json({
        success: false,
        message: "is_active must be true or false"
      });

    }


    const activeValue =
      is_active === true || is_active === 1
        ? 1
        : 0;


    const [result] = await db.execute(
      `
      UPDATE accounts

      SET is_active = ?

      WHERE id = ?
      `,
      [
        activeValue,
        accountId
      ]
    );


    if (result.affectedRows === 0) {

      return res.status(404).json({
        success: false,
        message: "Account not found"
      });

    }


    res.json({

      success: true,

      message:
        activeValue === 1
          ? "Account enabled successfully"
          : "Account disabled successfully",

      data: {
        id: Number(accountId),
        is_active: activeValue === 1
      }

    });

  } catch (error) {

    console.error("Update account status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update account status"
    });

  }

});

// ==========================================
// START SERVER
// ==========================================

const PORT = 3000;

app.listen(PORT, () => {

  console.log("\n=================================");
  console.log("🚀 SAMASTH API SERVER STARTED");
  console.log("=================================");

  console.log(
    `Server: http://localhost:${PORT}`
  );

  console.log(
    `Dashboard API: http://localhost:${PORT}/api/dashboard`
  );

  console.log(
    `Companies API: http://localhost:${PORT}/api/companies`
  );

});