import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import {
  addNewCity,
  deleteCity,
  getAllCity,
  getCityInfo,
  updateCity,
} from "../controllers/cityController.js";

const router = express.Router();

router.route("/city").post(isAuthenticated, singleUpload, addNewCity);
router.route("/city/:id").put(isAuthenticated, singleUpload, updateCity);
router.route("/cities").get(isAuthenticated, getAllCity);
router.route("/city/:id").get(isAuthenticated, getCityInfo);
router.route("/city/:id").delete(isAuthenticated, deleteCity);

export default router;
