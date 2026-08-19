const db = require("./database");

async function saveRunResult(runId, result) {
  try {
    const [dbResult] = await db.execute(
      `
      INSERT INTO automation_run_results
      (
        run_id,
        account_id,
        customer_name,
        devices_found,
        result,
        error_message
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        runId,
        result.accountId,
        result.customerName,
        result.devicesFound || 0,
        result.result,
        result.error || null
      ]
    );

    console.log(
      `📝 Run result saved: ${result.customerName} → ${result.result}`
    );

    return dbResult.insertId;

  } catch (error) {

    console.error(
      "❌ Error saving run result:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  saveRunResult
};