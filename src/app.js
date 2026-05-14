import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDatabase } from "./config/db.js";
import path from "path";
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
// app.use("/public", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// here "/uploads" means sever any thing start with this and "uploads" means the folder name
// Health route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

// Import Routes
// import testRoutes from "./routes/testRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import communityMemberRoutes from "./routes/communityMemberRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Use Routes
app.use("/sdedit/user", userRoutes);
app.use("/sdedit/community", communityRoutes);
app.use("/sdedit/community-member", communityMemberRoutes);
app.use("/sdedit/post", postRoutes);
app.use("/sdedit/comment", commentRoutes);
app.use("/sdedit/reply", commentRoutes);
// app.use("/sdedit/test", testRoutes);

//global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});
export default app;
