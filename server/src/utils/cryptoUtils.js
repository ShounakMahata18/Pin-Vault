import crypto from "crypto";
import { text } from "stream/consumers";

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const HMAC_SECRET_KEY = process.env.HMAC_SECRET_KEY;

export const encrypt = (data) => {
  if (!data) return data;

  const iv = crypto.randomBytes(12);
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer, iv);

  let encrypted = cipher.update(String(data), "utf-8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== "string") return encryptedText;

  const keyBuffer = Buffer.from(SECRET_KEY, "hex");
  const parts = encryptedText.split(":");

  if (parts.length === 3) {
    const [ivHex, authTagHex, encryptedData] = parts;

    try {
      const ivBuffer = Buffer.from(ivHex, "hex");
      const authTagBuffer = Buffer.from(authTagHex, "hex");

      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        keyBuffer,
        ivBuffer,
      );
      decipher.setAuthTag(authTagBuffer);

      let decrypted = decipher.update(encryptedData, "hex", "utf-8");
      decrypted += decipher.final("utf-8");

      return decrypted;
    } catch (err) {
      return null;
    }
  }

  // If it doesn't have 3 parts, it might not be encrypted yet (e.g., legacy data)
  return encryptedText;
};

export const hashDomain = (domain) => {
  return crypto
    .createHmac("sha256", HMAC_SECRET_KEY)
    .update(domain)
    .digest("hex");
};