const {
  getDashboardSummary
} = require("./dashboard-summary");


async function main() {

  try {

    console.log(
      "\n===== DASHBOARD SUMMARY =====\n"
    );

    const summary =
      await getDashboardSummary();


    console.log(
      "Total Companies:",
      summary.totalCompanies
    );

    console.log(
      "Total Devices:",
      summary.totalDevices
    );

    console.log(
      "Active Devices:",
      summary.activeDevices
    );

    console.log(
      "Inactive Devices:",
      summary.inactiveDevices
    );


    console.log(
      "\n===== LATEST AUTOMATION RUN =====\n"
    );

    console.table(
      summary.latestRun
        ? [summary.latestRun]
        : []
    );

  } catch (error) {

    console.error("\nTEST ERROR:");
    console.error(error.message);

  } finally {

    process.exit();

  }

}

main();