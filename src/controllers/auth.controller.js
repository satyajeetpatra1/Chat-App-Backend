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
      })

      // TODO: send a welcome email to user
    } else {
      res.status(400).json({ message: "Invalid User Data!" });
    }
  } catch (error) {
    console.log("Error in Signup Controller:", error)
    return res.status(500).json({ message: `Internal Server Error! : ${error}` });
  }
};
