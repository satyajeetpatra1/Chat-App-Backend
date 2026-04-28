import jwt from "jsonwebtoken";

export function generateToken(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true, // prevents xss attacks: cross site scripting
    sameSite: "strict", // prevents CSRF attacks
    secure: process.env.NODE_ENV === "production",
  });

  return token;
}
