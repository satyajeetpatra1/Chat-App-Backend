import { sendWelcomeEmail } from "../emails/emailHandler.js";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password)
      return res.status(400).json({ error: "All fiels are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password should be atleast 6 characters." });

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email))
      return res.status(400).json({ error: "Invalid Email" });

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists!" });

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      // TODO: send a welcome email to user

      try {
        sendWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          process.env.CLIENT_URL,
        );
      } catch (error) {
        console.error("Failed to send welcome email: ", error);
      }
    } else {
      res.status(400).json({ message: "Invalid User Data!" });
    }
  } catch (error) {
    console.log("Error in Signup Controller:", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error! : ${error}` });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and Password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials!" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid Credentials!" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in Login Controller: ", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error! : ${error}` });
  }
};

export const logout = async (_, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful!" });
  } catch (error) {
    console.log("Error in Logout Controller: ", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error! : ${error}` });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic)
      return res.status(400).json({ message: "Profile Pic is required!" });

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in Update Profile Controller: ", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error! : ${error}` });
  }
};
