import jwt from "jsonwebtoken";

import { User } from "../models/User.model.js";
import sendMail from "../config/sendMail.js";
import { getVerifyOtpHtml } from "../config/html.js";
import { redisClient } from "../index.js";

export const sendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "could not find user with that email",
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    await redisClient.setEx(`extension-otp:${email}`, 300, code);

    await sendMail({
      email,
      subject: "Your Pin Vault Login Code",
      html: getVerifyOtpHtml({ email, code }),
    });

    return res.json({
      success: true,
      message: "Code sent to email",
    });
  } catch (err) {
    console.error("Failed to send code:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send code",
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and code",
      });
    }

    const storedCode = await redisClient.get(`extension-otp:${email}`);

    if (!storedCode) {
      return res.status(400).json({
        success: false,
        message: "Code expired",
      });
    }

    if (storedCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    const user = await User.findOne({ email }).select("_id email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    await redisClient.del(`extension-otp:${email}`);

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.EXTENSION_TOKEN_SECRET,
      {
        expiresIn: "30d",
      },
    );

    await redisClient.setEx(
      `extension-active-session:${token}`,
      60 * 60 * 24 * 30,
      JSON.stringify({
        userId: user._id,
        email: user.email,
        loggedInAt: Date.now(),
      }),
    ); // 30 days expiration

    return res.json({
      success: true,
      token,
      email: user.email,
    });
  } catch (err) {
    console.error("Failed to verify code:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify code",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = auth.split(" ")[1];

    await redisClient.del(`extension-active-session:${token}`);

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.error("Failed to logout:", err);
    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
};

export const savePin = async (req, res) => {};
