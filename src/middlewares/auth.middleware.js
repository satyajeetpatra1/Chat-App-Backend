import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protectRoute = (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(!decoded) return res
        .status(401)
        .json({ message: "Unauthorized - Invalid token!" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user)      return res
        .status(401)
        .json({ message: "Unauthorized - User not found!" });

    req.user = user; // Attach user to request object

    next();
  } catch (error) {
    console.log("Error in auth middleware: ", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error!` });
  }
};
