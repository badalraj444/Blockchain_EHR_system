// backend/routes/blockchain.routes.js
import express from "express";
import { updateIsRegistered } from "../controller/blockchain.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// PATCH -> update the DB flag only
router.patch("/users/:id/isregistered", protectRoute, updateIsRegistered);

export default router;
