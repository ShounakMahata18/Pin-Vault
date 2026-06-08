import mongoose from "mongoose";

import Pin from "../models/Pin.model.js";

export const savePin = async (req, res) => {
  try {
    const { userId } = req.user;
    const { url, title, screenshot } = req.body;

    if (!url || !title || !screenshot) {
      return res.status(400).json({
        success: false,
        message: "Pin URL, title, and screenshot are unavailable",
      });
    }

    const hostname = new URL(url).hostname;

    const newPin = await Pin.create({
      userId,
      url,
      domain: hostname,
      title,
      screenshot,
      hostname,
      savedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Pin saved successfully",
      pinId: newPin._id,
    });
  } catch (error) {
    console.error("Error saving pin:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving the pin",
    });
  }
};

export const listPins = async (req, res) => {
  try {
    const { userId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const pins = await Pin.find({ userId })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPins = await Pin.countDocuments({ userId });

    return res.status(200).json({
      success: true,
      pins,
      page,
      limit,
      totalPins,
      hasMore: skip + pins.length < totalPins,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "An error occured" });
  }
};

export const deletePin = async (req, res) => {
  try {
    const { pinId } = req.params;

    await Pin.deleteOne({ _id: pinId });
    return res.status(200).json({
      success: true,
      message: "Pin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting pin:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the pin",
    });
  }
};

export const getDomains = async (req, res) => {
  const { userId } = req.params;

  const domains = await Pin.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$domain",
        count: { $sum: 1 },
        latestSavedAt: { $max: "$savedAt" },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  res.json({
    success: true,
    domains,
  });
};

export const getDomainPins = async (req, res) => {
  const { userId, domain } = req.params;

  const pins = await Pin.find({
    userId,
    domain,
  })
    .select("_id title url screenshot savedAt")
    .sort({ savedAt: -1 });

  res.json({
    success: true,
    pins,
  });
};
