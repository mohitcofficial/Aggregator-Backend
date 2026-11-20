import express from "express";
import { singleUpload } from "../middleware/multer.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import { salesLogin } from "../controllers/salesController.js";

const router = express.Router();

router.route("/sales/login").post(salesLogin);

export default router;
