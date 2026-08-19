const { getCompanySummary } =
  require("./company-summary");

async function main() {
  try {

    console.log(
      "\n===== COMPANY DEVICE SUMMARY =====\n"
    );

    const companies =
      await getCompanySummary();

    console.table(companies);

    console.log(
      `\nTotal Companies: ${companies.length}`
    );

  } catch (error) {

    console.error("TEST ERROR:");
    console.error(error.message);

  } finally {

    process.exit();

  }
}

main();