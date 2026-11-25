import mongoose from "mongoose";
import {
  calculateQuotation,
  generateQuotationPDF,
} from "../utils/quotationUtils.js";
import Quotation from "../models/Quotation.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { generateQuotationHTML } from "../templates/quotation.js";

const getNextQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();

  return `VX-QT-${year}-${timestamp}`;
};

// CREATE QUOTATION
export const createQuotation = catchAsyncError(async (req, res) => {
  try {
    const { leadId, items, taxMode, notes, terms, validUntil } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Add at least one location",
      });
    }

    const totals = calculateQuotation(items, taxMode);

    const quotationNumber = await getNextQuotationNumber();

    const quotation = await Quotation.create({
      quotationNumber,
      leadId: leadId || null,
      items: totals.items,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxableAmount: totals.taxableAmount,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      taxMode,
      notes,
      terms,
      validUntil,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      message: "Quotation created successfully",
      quotation,
    });
  } catch (error) {
    console.error("createQuotation:", error);
    return res.status(500).json({ message: "Unable to create quotation" });
  }
});

// GET QUOTATION LIST

export const getQuotations = catchAsyncError(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  // Pagination validation
  const pageNumber = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));

  const skip = (pageNumber - 1) * pageSize;

  // Search filter
  const filter = {};

  if (search.trim()) {
    filter.$or = [
      { quotationNumber: { $regex: search.trim(), $options: "i" } },
      { "client.name": { $regex: search.trim(), $options: "i" } },
      { "client.companyName": { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Fetch data and total count simultaneously
  const [data, total] = await Promise.all([
    Quotation.find(filter)
      .populate({
        path: "createdBy",
        select: "name role email",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),

    Quotation.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1 && totalPages > 0,
      nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
      prevPage: pageNumber > 1 ? pageNumber - 1 : null,
    },
  });
});

// GET SINGLE QUOTATION
export const getQuotationById = catchAsyncError(async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate({
        path: "leadId",
        select: "name email phoneNumber location",
      })
      .populate({
        path: "createdBy",
        select: "name email role",
      })
      .populate({
        path: "updatedBy",
        select: "name email role",
      });

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    return res.status(200).json({ quotation });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch quotation" });
  }
});

// UPDATE DRAFT
export const updateQuotation = catchAsyncError(async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);

    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    if (quotation.status !== "draft") {
      return res.status(400).json({
        message: "Only draft quotations can be edited",
      });
    }

    const { items, taxMode, notes, terms, validUntil } = req.body;

    const totals = calculateQuotation(items, taxMode);

    Object.assign(quotation, {
      items: totals.items,
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxableAmount: totals.taxableAmount,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      taxMode,
      notes,
      terms,
      validUntil,
      updatedBy: req.user?._id,
    });

    await quotation.save();

    return res.status(200).json({
      message: "Quotation updated",
      quotation,
    });
  } catch (error) {
    console.error("updateQuotation:", error);
    return res.status(500).json({ message: "Unable to update quotation" });
  }
});

export const deleteQuotation = catchAsyncError(async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quotation ID",
      });
    }

    // Find quotation
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found",
      });
    }

    // Allow deletion only for draft quotations
    if (quotation.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft quotations can be deleted",
      });
    }

    // Delete quotation
    await Quotation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Quotation deleted successfully",
      deletedQuotation: {
        _id: quotation._id,
        quotationNumber: quotation.quotationNumber,
      },
    });
  } catch (error) {
    next(error);
  }
});

const getQuotationForDocument = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorHandler("Invalid quotation ID", 400);
  }

  const quotation = await Quotation.findById(id).populate({
    path: "leadId",
    select: "name companyName email phoneNumber address",
  });

  if (!quotation) {
    throw new ErrorHandler("Quotation not found", 404);
  }

  return quotation;
};

// Preview quotation in browser
export const previewQuotation = catchAsyncError(async (req, res, next) => {
  const quotation = await getQuotationForDocument(req.params.id);

  const html = generateQuotationHTML(quotation, req.user?.email);

  res.set({
    "Content-Type": "text/html; charset=utf-8",
    "Content-Disposition": "inline",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });

  return res.status(200).send(html);
});

// Download quotation as PDF
export const downloadQuotationPDF = catchAsyncError(async (req, res, next) => {
  const quotation = await getQuotationForDocument(req.params.id);

  const html = generateQuotationHTML(quotation, req?.user.email);

  let pdfBuffer;

  try {
    pdfBuffer = await generateQuotationPDF(html);
  } catch (error) {
    console.error("Quotation PDF generation error:", error);

    return next(new ErrorHandler("Unable to generate quotation PDF", 500));
  }

  const safeQuotationNumber = String(
    quotation.quotationNumber || quotation._id,
  ).replace(/[^a-zA-Z0-9_-]/g, "_");

  const fileName =
    quotation?.quotationNumber ||
    `VirtualXcel-Quotation-${safeQuotationNumber}.pdf`;

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${fileName}"`,
    "Content-Length": pdfBuffer.length,
    "Cache-Control": "private, no-store",
  });

  return res.status(200).end(pdfBuffer);
});
