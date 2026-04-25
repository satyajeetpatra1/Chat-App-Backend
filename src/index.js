import express from 'express';

// routes
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

const app = express();

app.get("", (req, res) => {
    res.send("Chat App API running perfectly!")
})

app.use("/api/auth", authRoutes);

app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});