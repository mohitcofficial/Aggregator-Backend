import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createLead,
  deleteLead,
  getLeads,
  updateLeadStatus,
} from "../controllers/leadController.js";

const router = express.Router();

router.route("/lead").post(isAuthenticated, createLead);
router.route("/leads").post(isAuthenticated, getLeads);
router.route("/lead/:id").put(isAuthenticated, updateLeadStatus);
router.route("/lead/:id").delete(isAuthenticated, deleteLead);

export default router;
