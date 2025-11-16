import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { connectDB } from "./lib/db.js";

import path from "path";
import authRoutes from "./routes/auth.routes.js";
import blockchainRoutes from "./routes/blockchain.routes.js";

const app = express();

const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/blockchain", blockchainRoutes);


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client", "dist")));
  app.use((req, res, next) => {
    // if you want to skip API routes, check req.path and next() accordingly
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
  connectDB();
});
