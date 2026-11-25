import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
import {
  createLead,
  deleteLead,
  getLeadById,
  getAllLeads,
  getMyLeads,
  updateLead,
  deleteFollowUp,
  deleteLeadFollowUp,
  updateLeadFollowUp,
  createLeadFollowUp,
} from "../controllers/leadController.js";

const router = express.Router();

router
  .route("/lead/:id")
  .get(
    isAuthenticated,
    authorizeRoles("super_admin", "admin", "sales"),
    getLeadById,
  );
router
  .route("/lead")
  .post(
    isAuthenticated,
    authorizeRoles("super_admin", "admin", "sales"),
    createLead,
  );
router
  .route("/my-leads")
  .post(isAuthenticated, authorizeRoles("sales"), getMyLeads);
router
  .route("/leads")
  .post(isAuthenticated, authorizeRoles("super_admin", "admin"), getAllLeads);
router
  .route("/lead/:id")
  .put(
    isAuthenticated,
    authorizeRoles("super_admin", "admin", "sales"),
    updateLead,
  );
router
  .route("/lead/:id")
  .delete(isAuthenticated, authorizeRoles("super_admin", "admin"), deleteLead);
router
  .route("/lead/:leadId/followup/:followUpId")
  .delete(
    isAuthenticated,
    authorizeRoles("super_admin", "admin"),
    deleteFollowUp,
  );

router.post(
  "/lead/:id/followup",
  isAuthenticated,
  authorizeRoles("super_admin", "admin"),
  createLeadFollowUp,
);

router.put(
  "/lead/:id/followup/:followUpId",
  isAuthenticated,
  authorizeRoles("super_admin", "admin"),
  updateLeadFollowUp,
);

router.delete(
  "/lead/:id/followup/:followUpId",
  isAuthenticated,
  authorizeRoles("super_admin", "admin"),
  deleteLeadFollowUp,
);

export default router;
