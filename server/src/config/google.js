import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);

export default googleClient;