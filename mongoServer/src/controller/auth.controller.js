import jwt from "jsonwebtoken";

import User from "../models/User.js";

function pemLooksLikePublicKey(pem) {
  return (
    typeof pem === "string" &&
    /-----BEGIN PUBLIC KEY-----/.test(pem) &&
    /-----END PUBLIC KEY-----/.test(pem)
  );
}

function isHexBytes32Hex(s) {
  return typeof s === "string" && /^0x[0-9a-fA-F]{64}$/.test(s);
}

export async function signup(req, res) {
  const { email, password, role, publicpem, hashedkey } = req.body;

  try {
    // Basic required fields
    if (!email || !password || !role || !publicpem || !hashedkey) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!["Patient", "CareProvider", "Researcher"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Validate hashedkey format early
    if (!isHexBytes32Hex(hashedkey)) {
      return res
        .status(400)
        .json({ message: "hashedkey must be 0x + 64 hex chars (bytes32)" });
    }

    // Validate public PEM basic format
    if (!pemLooksLikePublicKey(publicpem)) {
      return res
        .status(400)
        .json({ message: "publicpem does not look like a PEM public key" });
    }
    // todo***********: Verify that the public key corresponds to the hashedkey

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists! please use a different one." });
    }

    const newUser = await User.create({
      email,
      password, // consider hashing with bcrypt before saving in production
      role,
      publicpem,
      hashedkey,
    });

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ success: true, user: newUser });
    console.log("User signed up successfully:", newUser.email);
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fileds are required!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({
          message: "Invalid credentials. Please check the email or password!",
        });
    }
    const isPaaswordCorrect = await user.matchPassword(password);
    if (!isPaaswordCorrect)
      return res
        .status(401)
        .json({
          message: "Invalid credentials. Please check the email or password!",
        });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, user });
    console.log("User logged in successfully:", user.email);
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, messgae: "Logged out successfully!" });
}
