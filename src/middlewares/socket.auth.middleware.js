import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("jwt="))
      ?.split("=")[1];

    if (!token) {
      console.log("Socket connection rejected: No token provided.");
      return next(new Error("Unauthorized - No token provided."));
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      console.log("Socket connection rejected: Invalid Token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return next(new Error("Unauthorized - User not found!"));

    socket.user = user; // Attach user to socket
    socket.userId = user._id.toString();

    console.log(
      `Socket authenticated for user: ${user.fullName} (${user._id})`,
    );

    next();
  } catch (error) {
    console.log("Error in socket authentication", error);
    next(new Error("Unauthorized - Authentication Failed"));
  }
};
