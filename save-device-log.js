const db = require("./database");

async function saveDeviceLog(deviceId, device) {
  try {

    const sql = `
      INSERT INTO device_status_logs
      (
        device_id,
        status,
        flow,
        total
      )
      VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      deviceId,
      device.status,
      device.flow,
      device.total
    ]);

    console.log(
      `📊 Status log saved for: ${device.label}`
    );

    return result.insertId;

  } catch (error) {

    console.error(
      "❌ Error saving device log:",
      error.message
    );

    throw error;
  }
}

module.exports = {
  saveDeviceLog
};