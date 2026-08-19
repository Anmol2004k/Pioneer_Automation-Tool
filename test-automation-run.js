const {
  createAutomationRun,
  completeAutomationRun
} = require("./automation-run");

async function main() {
  try {

    const runId = await createAutomationRun(20);

    console.log("Testing...");
    
    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );

    await completeAutomationRun(
      runId,
      20,
      0
    );

  } catch (error) {

    console.error("TEST ERROR:");
    console.error(error.message);

  } finally {

    process.exit();

  }
}

main();