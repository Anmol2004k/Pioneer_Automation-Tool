const db = require("./database");

async function getCompanySummary() {
  try {
    const [companies] = await db.execute(`
      SELECT
        a.id AS account_id,
        a.customer_name,

        COUNT(d.id) AS total_devices,

        SUM(
          CASE
            WHEN d.current_status = 'Active'
            THEN 1
            ELSE 0
          END
        ) AS active_devices,

        SUM(
          CASE
            WHEN d.current_status = 'Inactive'
            THEN 1
            ELSE 0
          END
        ) AS inactive_devices

      FROM accounts a

      LEFT JOIN devices d
        ON a.id = d.account_id

      WHERE a.is_active = 1

      GROUP BY
        a.id,
        a.customer_name

      ORDER BY
        a.customer_name
    `);

    return companies;

  } catch (error) {

    console.error(
      "❌ Error getting company summary:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  getCompanySummary
};