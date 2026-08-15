const db = require("./database");

async function saveDevice(accountId, device) {
  try {

    // Check karo device pehle se database mein hai ya nahi
    const [existingDevices] = await db.execute(
      `
      SELECT id
      FROM devices
      WHERE account_id = ?
      AND device_label = ?
      `,
      [
        accountId,
        device.label
      ]
    );

    // Agar device already exist karta hai → UPDATE
    if (existingDevices.length > 0) {

      const deviceId = existingDevices[0].id;

      await db.execute(
        `
        UPDATE devices
        SET
          current_status = ?,
          current_flow = ?,
          current_total = ?,
          last_checked = NOW()
        WHERE id = ?
        `,
        [
          device.status,
          device.flow,
          device.total,
          deviceId
        ]
      );

      console.log(
        `🔄 Device updated: ${device.label}`
      );

      return deviceId;
    }

    // Agar device nahi hai → INSERT
    const [result] = await db.execute(
      `
      INSERT INTO devices
      (
        account_id,
        device_label,
        current_status,
        current_flow,
        current_total,
        last_checked
      )
      VALUES (?, ?, ?, ?, ?, NOW())
      `,
      [
        accountId,
        device.label,
        device.status,
        device.flow,
        device.total
      ]
    );

    console.log(
      `✅ New device added: ${device.label}`
    );

    return result.insertId;

  } catch (error) {

    console.error(
      `❌ Error saving ${device.label}:`,
      error.message
    );

    throw error;
  }
}

module.exports = {
  saveDevice
};