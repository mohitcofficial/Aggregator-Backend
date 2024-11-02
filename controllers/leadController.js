import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Lead } from "../models/Lead.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const createLead = catchAsyncError(async (req, res, next) => {
  const { name, email, phoneNumber, location, requirement, origin } = req.body;

  if (!name) return next(new ErrorHandler("Name is mandatory !", 400));
  if (!email) return next(new ErrorHandler("Email is mandatory !", 400));
  if (!phoneNumber)
    return next(new ErrorHandler("Phone Number is mandatory !", 400));
  if (!location) return next(new ErrorHandler("Location is mandatory !", 400));
  if (!requirement)
    return next(new ErrorHandler("Requirement is mandatory !", 400));

  const lead = await Lead.create({
    name,
    email,
    phoneNumber,
    location,
    requirement,
    origin: origin || "Mail",
  });

  res.status(201).json({
    message: "Lead Created Successfully",
    lead,
  });
});

export const getLeads = catchAsyncError(async (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(
      new ErrorHandler("Please provide both start and end dates", 400)
    );
  }

  try {
    const start = new Date(new Date(startDate).setHours(0, 0, 0, 0));
    const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));

    const leads = await Lead.find({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({
      message: "Leads Fetched Successfully",
      count: leads.length,
      leads,
    });
  } catch (error) {
    next(error);
  }
});

export const deleteLead = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  if (!id) return next(new ErrorHandler("Please provide lead ID", 400));

  try {
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.status(200).json({
      message: "Lead deleted successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
});

export const updateLeadStatus = catchAsyncError(async (req, res, next) => {
  const { status, origin } = req.body;
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({
      message: "ID is required",
    });
  }

  const validStatuses = ["Unseen", "Contacted", "Converted", "Not Interested"];
  if (status && !validStatuses.includes(status))
    return next(
      new ErrorHandler(
        "Invalid status value. Allowed values are: Unseen, Contacted, Converted, Not Interested",
        400
      )
    );

  const validOrigins = ["Mail", "Phone", "Whatsapp", "Others"];
  if (origin && !validOrigins.includes(origin)) {
    return next(
      new ErrorHandler(
        "Invalid origin value. Allowed values are: Mail, Phone, Whatsapp, Others",
        400
      )
    );
  }

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (origin) updateData.origin = origin;

    const lead = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!lead) return next(new ErrorHandler("Lead Not Found!", 404));

    res.status(200).json({
      message: "Lead status updated successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
});
