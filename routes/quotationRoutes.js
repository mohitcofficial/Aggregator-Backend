import express from "express";
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
  previewQuotation,
  downloadQuotationPDF,
} from "../controllers/quotationController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Attach your existing authentication middleware to these routes.
router.post("/quotation", isAuthenticated, createQuotation);
router.get("/quotations", isAuthenticated, getQuotations);
router.get("/quotation/:id", isAuthenticated, getQuotationById);
router.put("/quotation/:id", isAuthenticated, updateQuotation);
router.delete("/quotation/:id", isAuthenticated, deleteQuotation);

router.get("/quotation/:id/preview", isAuthenticated, previewQuotation);
router.get("/quotation/:id/pdf", isAuthenticated, downloadQuotationPDF);

export default router;
