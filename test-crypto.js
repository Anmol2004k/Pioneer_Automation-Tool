const { encrypt, decrypt } = require("./crypto");

const password = "TestPassword123";

const encrypted = encrypt(password);

console.log("Original:", password);
console.log("Encrypted:", encrypted);

const decrypted = decrypt(encrypted);

console.log("Decrypted:", decrypted);