import express from "express";
import {
  adminLogin,
  createAdmin,
  deleteAdmin,
  getAllAdmins,
  getMyProfile,
  logout,
} from "../controllers/adminController.js";
import { singleUpload } from "../middleware/multer.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/admin/create").post(singleUpload, createAdmin);
router.route("/admin/login").post(adminLogin);
router.route("/admin").post(getAllAdmins);
router.route("/admin/delete").delete(deleteAdmin);
router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/logout").get(logout);

export default router;
