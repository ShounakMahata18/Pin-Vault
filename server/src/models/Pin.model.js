import mongoose from "mongoose";

import { encrypt, decrypt } from "../utils/cryptoUtils.js";

const FIELDS_TO_ENCRYPT = ["url", "domain", "title", "screenshot"];

const PinSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "Untitled",
      trim: true,
    },
    screenshot: {
      type: String,
    },
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

PinSchema.index({ userId: 1, savedAt: -1 });
PinSchema.index({ userId: 1, domain: 1, savedAt: -1 });

PinSchema.pre("save", function (next) {
  const isModified = FIELDS_TO_ENCRYPT.some((field) => this.isModified(field));

  if (!isModified) return;

  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (this[field] && this.isModified(field)) {
      const tempObj = { [field]: this[field] };
      const encryptedObj = encrypt(tempObj, [field]);

      this[field] = encryptedObj[field];
    }
  });
});

PinSchema.post("init", function (doc) {
  const decryptedData = decrypt(doc.toObject(), FIELDS_TO_ENCRYPT);

  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (doc[field] !== undefined) {
      doc[field] = decryptedData[field];
    }
  });
});

PinSchema.post("save", function (doc) {
  const decryptedData = decrypt(doc.toObject(), FIELDS_TO_ENCRYPT);

  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (doc[field] !== undefined) {
      doc[field] = decryptedData[field];
    }
  });
});

const Pin = mongoose.model("Pin", PinSchema);
export default Pin;
