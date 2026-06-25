import mongoose from "mongoose";

import { encrypt, decrypt, hashDomain } from "../utils/cryptoUtils.js";

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
    domainHash: {
      type: String,
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
  },
  {
    timestamps: true,
  },
);

PinSchema.index({ userId: 1, createdAt: -1 });
PinSchema.index({ userId: 1, hashDomain: 1, createdAt: -1 });

PinSchema.pre("save", function () {
  const isModified = FIELDS_TO_ENCRYPT.some((field) => this.isModified(field));

  if (!isModified) return;

  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (this[field] && this.isModified(field)) {
      this[field] = encrypt(this[field]);
    }
  });

  this["domainHash"] = hashDomain(this["domain"]);
});

PinSchema.post("init", function (doc) {
  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (doc[field]) {
      doc[field] = decrypt(doc[field]);
    }
  });
});

PinSchema.post("save", function (doc) {
  FIELDS_TO_ENCRYPT.forEach((field) => {
    if (doc[field]) {
      doc[field] = decrypt(doc[field]);
    }
  });
});

const Pin = mongoose.model("Pin", PinSchema);
export default Pin;
