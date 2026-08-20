const db = require("./database");

async function getDashboardSummary() {
  try {

    // ==============================
    // DEVICE + COMPANY SUMMARY
    // ==============================

    const [deviceData] = await db.execute(`
      SELECT
        COUNT(DISTINCT a.id) AS total_companies,

        COUNT(d.id) AS total_devices,

        COALESCE(
          SUM(
            CASE
              WHEN d.current_status = 'Active'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS active_devices,

        COALESCE(
          SUM(
            CASE
              WHEN d.current_status = 'Inactive'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS inactive_devices

      FROM accounts a

      LEFT JOIN devices d
        ON a.id = d.account_id

      WHERE a.is_active = 1
    `);


    // ==============================
    // LATEST AUTOMATION RUN
    // ==============================

    const [latestRun] = await db.execute(`
      SELECT
        id,
        started_at,
        finished_at,
        total_accounts,
        success_count,
        failed_count,
        status

      FROM automation_runs

      ORDER BY id DESC

      LIMIT 1
    `);


    return {
      totalCompanies: deviceData[0].total_companies,
      totalDevices: deviceData[0].total_devices,
      activeDevices: deviceData[0].active_devices,
      inactiveDevices: deviceData[0].inactive_devices,

      latestRun: latestRun.length > 0
        ? latestRun[0]
        : null
    };

  } catch (error) {

    console.error(
      "❌ Error getting dashboard summary:",
      error.message
    );

    throw error;
  }
}


module.exports = {
  getDashboardSummary
};