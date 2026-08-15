const { saveDevice } = require("./save-device");

async function main() {

  // IMPORTANT:
  // Ye account ID aapke MySQL accounts table ka ID hai.
  const accountId = 2;

  const device = {
    label: "USFL_UPCF156",
    status: "Active",
    flow: "0.00 m3/hr",
    total: "7363.47 m3"
  };

  try {

    const deviceId = await saveDevice(
      accountId,
      device
    );

    console.log(
      "Device saved successfully!"
    );

    console.log(
      "Device ID:",
      deviceId
    );

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