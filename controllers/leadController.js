import mongoose from "mongoose";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Lead } from "../models/Lead.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/User.js";
import Quotation from "../models/Quotation.js";

export const createLead = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    service,
    location,
    budget,
    source,
    status,
    assignedTo,
    profit,
    remark,
  } = req.body;
  if (!phoneNumber)
    return next(new ErrorHandler("Phone Number is mandatory !", 400));
  if (!assignedTo && req.user.role === "admin")
    return next(new ErrorHandler("Assigned Employee ID Not Found !", 400));

  var assignedUser;
  if (req.user.role === "admin") {
    const salesPerson = await User.findById(assignedTo);
    if (!salesPerson)
      return next(new ErrorHandler("Invalid Assigned ID !", 400));
    else if (salesPerson.role !== "sales")
      return next(new ErrorHandler("User ID is not of a Sales Person !", 400));
    else assignedUser = assignedTo;
  }
  if (req.user.role === "sales") assignedUser = req.user._id;

  const leadData = {
    phoneNumber,
    assignedTo: assignedUser,
    createdBy: req.user._id,
  };

  if (name) leadData.name = name;
  if (email) leadData.email = email;
  if (service) leadData.service = service;
  if (location) leadData.location = location;
  if (budget) leadData.budget = budget;
  if (source) leadData.source = source;
  if (status) leadData.status = status;
  if (profit !== undefined) leadData.profit = profit;
  if (remark) leadData.remark = remark;

  const lead = await Lead.create(leadData);

  res.status(201).json({
    message: "Lead Created Successfully",
    lead,
  });
});

export const getMyLeads = catchAsyncError(async (req, res, next) => {
  const { startDate, endDate, status, source, page = 1, limit = 25 } = req.body;

  if (!startDate || !endDate)
    return next(
      new ErrorHandler("Please provide both start and end dates", 400),
    );

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end))
    return next(new ErrorHandler("Invalid date format", 400));

  if (start > end)
    return next(
      new ErrorHandler("Start date cannot be greater than end date", 400),
    );

  const employeeId = req.user._id;

  const normalizedStart = new Date(start.setHours(0, 0, 0, 0));
  const normalizedEnd = new Date(end.setHours(23, 59, 59, 999));

  const query = {
    assignedTo: employeeId,
    createdAt: { $gte: normalizedStart, $lte: normalizedEnd },
  };

  if (status && status !== "all") query.status = status;
  if (source && source !== "all") query.source = source;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const totalLeads = await Lead.countDocuments(query);

  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  res.status(200).json({
    success: true,
    message: "Leads Fetched Successfully",
    total: totalLeads,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalLeads / limitNumber),
    limit: limitNumber,
    count: leads.length,
    leads,
  });
});

export const getAllLeads = catchAsyncError(async (req, res, next) => {
  const {
    startDate,
    endDate,
    source,
    status,
    assignedTo,
    page = 1,
    limit = 25,
  } = req.body;

  if (!startDate || !endDate)
    return next(
      new ErrorHandler("Please provide both start and end dates", 400),
    );

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start) || isNaN(end))
    return next(new ErrorHandler("Invalid date format", 400));

  if (start > end)
    return next(
      new ErrorHandler("Start date cannot be greater than end date", 400),
    );

  const normalizedStart = new Date(start.setHours(0, 0, 0, 0));
  const normalizedEnd = new Date(end.setHours(23, 59, 59, 999));

  const query = {
    createdAt: { $gte: normalizedStart, $lte: normalizedEnd },
  };

  if (status && status !== "all") query.status = status;
  if (source && source !== "all") query.source = source;

  if (assignedTo && assignedTo !== "all") {
    if (!mongoose.Types.ObjectId.isValid(assignedTo))
      return next(new ErrorHandler("Invalid assignedTo ID", 400));

    query.assignedTo = assignedTo;
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const totalLeads = await Lead.countDocuments(query);

  const leads = await Lead.find(query)
    .populate("assignedTo", "name email phone")
    .populate("createdBy", "name")
    .populate("followUps.createdBy", "name email")
    .populate("followUps.lastEditedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  res.status(200).json({
    success: true,
    message: "Leads Fetched Successfully",

    total: totalLeads,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalLeads / limitNumber),
    limit: limitNumber,

    count: leads.length,
    leads,
  });
});

export const getLeadById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler("Lead ID is required", 400));
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Lead ID", 400));
  }

  const objectId = new mongoose.Types.ObjectId(id);

  const lead = await Lead.findById(objectId)
    .populate("assignedTo", "name email phone")
    .populate("createdBy", "name")
    .populate("followUps.createdBy", "name email")
    .populate("followUps.lastEditedBy", "name");

  if (!lead) {
    return next(new ErrorHandler("Lead not found", 404));
  }

  const isAdmin = req.user.role === "super_admin" || req.user.role === "admin";

  const isAssignedEmployee =
    lead.assignedTo &&
    lead.assignedTo._id.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignedEmployee) {
    return next(new ErrorHandler("Access denied", 403));
  }

  const quotations = await Quotation.find({ leadId: lead._id })
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email");

  res.status(200).json({
    success: true,
    lead,
    quotations,
  });
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

export const updateLead = catchAsyncError(async (req, res, next) => {
  const {
    status,
    source,
    remark,
    profit,
    name,
    email,
    followUpNote,
    followUpID,
  } = req.body;

  const id = req.params.id;

  if (!id) return next(new ErrorHandler("ID is required", 400));

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Lead ID", 400));
  }

  const validStatuses = [
    "new",
    "interested",
    "not_interested",
    "unreachable",
    "converted",
  ];

  if (status && !validStatuses.includes(status)) {
    return next(new ErrorHandler("Invalid status value.", 400));
  }

  const validSources = ["mail", "call", "whatsapp", "meta", "referral"];

  if (source && !validSources.includes(source)) {
    return next(new ErrorHandler("Invalid source value.", 400));
  }

  const lead = await Lead.findById(id);

  if (!lead) return next(new ErrorHandler("Lead Not Found!", 404));

  const isAdmin = req.user.role === "admin";
  const isAssignedEmployee =
    lead.assignedTo && lead.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignedEmployee) {
    return next(new ErrorHandler("Access denied", 403));
  }

  if (followUpID) {
    const followUp = lead.followUps.id(followUpID);

    if (!followUp) {
      return next(new ErrorHandler("Follow-up not found", 404));
    }

    const isCreator = followUp.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return next(
        new ErrorHandler("You can only update your own follow-up", 403),
      );
    }

    if (followUpNote) followUp.note = followUpNote;

    followUp.lastEditedAt = new Date();
    followUp.lastEditedBy = req.user._id;

    await lead.save();

    await lead.populate([
      { path: "assignedTo", select: "name email phone" },
      { path: "followUps.createdBy", select: "name email" },
      { path: "followUps.lastEditedBy", select: "name email" },
    ]);

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      lead,
    });
  }

  const updateData = {};

  if (status) updateData.status = status;
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (source) updateData.source = source;
  if (remark) updateData.remark = remark;
  if (profit !== undefined) updateData.profit = profit;

  if (status === "converted" && !lead.convertedAt) {
    updateData.convertedAt = new Date();
  }

  if (followUpNote) {
    updateData.$push = {
      followUps: {
        date: new Date(),
        note: followUpNote,
        createdBy: req.user._id,
      },
    };
  }

  if (Object.keys(updateData).length === 0) {
    return next(new ErrorHandler("No valid fields provided to update", 400));
  }

  const updatedLead = await Lead.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .populate("assignedTo", "name email phone")
    .populate("createdBy", "name email phone")
    .populate("followUps.createdBy", "name email")
    .populate("followUps.lastEditedBy", "name email");

  res.status(200).json({
    success: true,
    message: "Lead updated successfully",
    lead: updatedLead,
  });
});

export const deleteFollowUp = catchAsyncError(async (req, res, next) => {
  const { leadId, followUpId } = req.params;

  if (!leadId || !followUpId) {
    return next(new ErrorHandler("Lead ID and Follow-up ID are required", 400));
  }

  if (
    !mongoose.Types.ObjectId.isValid(leadId) ||
    !mongoose.Types.ObjectId.isValid(followUpId)
  ) {
    return next(new ErrorHandler("Invalid ID provided", 400));
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    return next(new ErrorHandler("Lead not found", 404));
  }

  const followUp = lead.followUps.id(followUpId);

  if (!followUp) {
    return next(new ErrorHandler("Follow-up not found", 404));
  }

  followUp.deleteOne();

  await lead.save();

  await lead.populate([
    { path: "assignedTo", select: "name email phone" },
    { path: "followUps.createdBy", select: "name email" },
    { path: "followUps.lastEditedBy", select: "name email" },
  ]);

  res.status(200).json({
    success: true,
    message: "Follow-up deleted successfully",
    lead,
  });
});

export const createLeadFollowUp = catchAsyncError(async (req, res, next) => {
  try {
    const { date, note } = req.body;

    if (!date || !note?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Date and note are required",
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.followUps.push({
      date: new Date(date),
      note: note.trim(),
      createdBy: req.user._id,
    });

    await lead.save();

    return res.status(201).json({
      success: true,
      message: "Follow-up created successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE FOLLOW-UP
export const updateLeadFollowUp = catchAsyncError(async (req, res, next) => {
  try {
    const { date, note } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const followUp = lead.followUps.id(req.params.followUpId);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    if (date) followUp.date = new Date(date);
    if (note !== undefined) followUp.note = note.trim();

    followUp.lastEditedAt = new Date();
    followUp.lastEditedBy = req.user._id;

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up updated successfully",
      lead,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE FOLLOW-UP
export const deleteLeadFollowUp = catchAsyncError(async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const followUp = lead.followUps.id(req.params.followUpId);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: "Follow-up not found",
      });
    }

    followUp.deleteOne();

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});
