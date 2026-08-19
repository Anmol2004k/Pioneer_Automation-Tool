const db = require("./database");

async function createAutomationRun(totalAccounts) {
  try {
    const [result] = await db.execute(
      `
      INSERT INTO automation_runs
      (
        total_accounts,
        status
      )
      VALUES (?, ?)
      `,
      [
        totalAccounts,
        "Running"
      ]
    );

    console.log("🚀 Automation Run Created");
    console.log("Run ID:", result.insertId);

    return result.insertId;

  } catch (error) {
    console.error("❌ Error creating automation run:");
    throw error;
  }
}

async function completeAutomationRun(
  runId,
  successCount,
  failedCount
) {
  try {
    await db.execute(
      `
      UPDATE automation_runs
      SET
        finished_at = NOW(),
        success_count = ?,
        failed_count = ?,
        status = ?
      WHERE id = ?
      `,
      [
        successCount,
        failedCount,
        "Completed",
        runId
      ]
    );

    console.log("✅ Automation Run Completed");

  } catch (error) {
    console.error("❌ Error completing automation run:");
    throw error;
  }
}

module.exports = {
  createAutomationRun,
  completeAutomationRun
};