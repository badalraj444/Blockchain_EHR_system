// backend/controllers/blockchain.controller.js
import User from "../models/User.js";

/**
 * PATCH /api/blockchain/users/:id/isregistered
 * Body: { isRegistered: true|false }
 * Protected route (requires auth).
 */
export async function updateIsRegistered(req, res) {
  try {
    const userId = req.params.id;
    const { isRegistered } = req.body;

    if (typeof isRegistered !== "boolean") {
      return res.status(400).json({ success: false, message: "isRegistered must be boolean" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isRegistered2Blockchain: isRegistered },
      { new: true }
    ).select("-password"); // hide password

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("updateIsRegistered error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
