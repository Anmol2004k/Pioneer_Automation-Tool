const { saveDeviceLog } = require("./save-device-log");

async function main() {

  // devices table mein jo Device ID mila tha
  const deviceId = 1;

  const device = {
    label: "USFL_UPCF156",
    status: "Active",
    flow: "0.00 m3/hr",
    total: "7363.47 m3"
  };

  try {

    const logId = await saveDeviceLog(
      deviceId,
      device
    );

    console.log("Log saved successfully!");
    console.log("Log ID:", logId);

  } catch (error) {

    console.error(
      "TEST FAILED:",
      error.message
    );

  } finally {

    process.exit();
  }
}

main();