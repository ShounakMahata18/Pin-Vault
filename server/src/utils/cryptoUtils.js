import crypto from "crypto";

const SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY;
const ALGORITHM = "aes-256-gcm";

export const encrypt = (data, fields = []) => {
  const result = { ...data };

  for (const key in data) {
    if (fields.includes(key)) {
      const iv = crypto.randomBytes(12);
      const keyBuffer = Buffer.from(SECRET_KEY, "hex");
      const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);

      let encrypted = cipher.update(String(data[key]), "utf-8", "hex");
      encrypted += cipher.final("hex");

      const authTag = cipher.getAuthTag();

      result[key] = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }
  }

  return result;
};

export const decrypt = (data, fields = []) => {
  const result = { ...data };
  const keyBuffer = Buffer.from(SECRET_KEY, "hex");

  for (const key in data) {
    if (fields.includes(key) && typeof data[key] === "string") {
      const parts = data[key].split(":");

      // Ensure the string is properly formatted before attempting decryption
      if (parts.length === 3) {
        const [ivHex, authTagHex, encryptedText] = parts;

        const ivBuffer = Buffer.from(ivHex, "hex");
        const authTagBuffer = Buffer.from(authTagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, ivBuffer);
        
        decipher.setAuthTag(authTagBuffer);

        try {
          let decrypted = decipher.update(encryptedText, "hex", "utf-8");
          decrypted += decipher.final("utf-8");
          
          result[key] = decrypted;
        } catch (err) {
          result[key] = null;
        }
      }
    }
  }

  return result;
};