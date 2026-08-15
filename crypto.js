require("dotenv").config();

const crypto = require("crypto");

// 32-byte encryption key generate from .env secret
const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_KEY)
  .digest();

const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");

  encrypted += cipher.final("hex");

  // IV + encrypted data
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_KEY,
    iv
  );

  let decrypted = decipher.update(
    encrypted,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  encrypt,
  decrypt
};