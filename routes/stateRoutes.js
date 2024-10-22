import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import {
  addNewState,
  deleteState,
  getAllStates,
  getStateInfo,
  updateState,
} from "../controllers/stateController.js";

const router = express.Router();

router.route("/state").post(isAuthenticated, singleUpload, addNewState);
router.route("/state").put(isAuthenticated, singleUpload, updateState);
router.route("/states").get(isAuthenticated, getAllStates);
router.route("/state/:id").get(isAuthenticated, getStateInfo);
router.route("/state/:id").delete(isAuthenticated, deleteState);

export default router;
