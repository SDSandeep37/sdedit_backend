import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/db.js";
//connect to database
connectDatabase();
const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Import Routes
// import userRoutes from "./routes/userRoutes.js";
// import postRoutes from "./routes/postRoutes.js";

// Use Routes
// app.use("/api/users", userRoutes);
// app.use("/api/posts", postRoutes);

//global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
export default app;
