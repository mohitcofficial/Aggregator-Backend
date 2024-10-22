import express from "express";
import { sendMail } from "../controllers/userController.js";

const router = express.Router();

router.route("/send-email").post(sendMail);

export default router;
