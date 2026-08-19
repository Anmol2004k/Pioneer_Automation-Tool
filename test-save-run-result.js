const { saveRunResult } = require("./save-run-result");

async function main() {

  try {

    // phpMyAdmin ke automation_runs table mein
    // jo latest Run ID hai, woh yahan use karo
    const runId = 1;

    const result = {
      accountId: 2,
      customerName: "AMBER CROP SCIENCE PVT LTD",
      devicesFound: 1,
      result: "Success",
      error: null
    };

    const resultId = await saveRunResult(
      runId,
      result
    );

    console.log("Result saved successfully!");
    console.log("Result ID:", resultId);

  } catch (error) {

    console.error("TEST ERROR:");
    console.error(error.message);

  } finally {

    process.exit();

  }
}

main();