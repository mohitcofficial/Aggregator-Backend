import express from "express";
import {
  adminLogin,
  createAdmin,
  logout,
} from "../controllers/adminController.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/admin/create").post(singleUpload, createAdmin);
router.route("/admin/login").post(adminLogin);
router.route("/logout").get(logout);

export default router;
