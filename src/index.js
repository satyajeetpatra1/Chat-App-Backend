import express from "express";

// DB connection
import { connectDB } from "./lib/db.js";

// routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

// parse cookies
app.use(cookieParser());

app.get("", (req, res) => {
  res.send("Chat App API running perfectly!");
});

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);

  connectDB();
});
