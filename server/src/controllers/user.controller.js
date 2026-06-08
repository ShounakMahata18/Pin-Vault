import TryCatch from "../middlewares/TryCatch.js";

export const adminController = TryCatch((req, res) => {
  res.json({ message: "Hello admin" });
});