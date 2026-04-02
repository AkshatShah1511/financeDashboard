const { z } = require("zod");
const recordService = require("../services/recordService");
const auditService = require("../services/auditService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");
const { ValidationError, AppError } = require("../utils/errors");

// Helper to check 2 decimal places
const hasMaxTwoDecimals = (val) => {
  const str = val.toString();
  if (str.includes('.')) {
    return str.split('.')[1].length <= 2;
  }
  return true;
};

// Helper for YYYY-MM-DD
const isValidDateString = (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val));

const recordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").refine(hasMaxTwoDecimals, "Amount can have max 2 decimal places"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(2, "Category must be at least 2 characters"),
  date: z.string().refine(isValidDateString, "Invalid date format, use YYYY-MM-DD"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
});

const updateSchema = recordSchema.partial();

const createRecord = asyncHandler(async (req, res) => {
  const parseResult = recordSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const { amount, type, category, date, notes } = parseResult.data;

  const dataToSave = {
    amount,
    type,
    category: category.toLowerCase(),
    date: new Date(date),
    notes,
    createdBy: req.user.id
  };

  const newRecord = await recordService.createRecord(dataToSave);

  await auditService.logAction({
    action: "created",
    resource: "record",
    resourceId: newRecord.id,
    performedBy: req.user.id
  });

  return sendSuccess(res, newRecord, 201);
});

const getRecords = asyncHandler(async (req, res) => {
  const { type, category, from, to, page = "1", limit = "10" } = req.query;

  if (from && !isValidDateString(from)) {
    throw new ValidationError("Invalid date format, use YYYY-MM-DD");
  }
  if (to && !isValidDateString(to)) {
    throw new ValidationError("Invalid date format, use YYYY-MM-DD");
  }

  if (from && to && new Date(from) > new Date(to)) {
    throw new ValidationError("Start date cannot be after end date");
  }

  const pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 10;
  if (limitNum > 100) limitNum = 100;

  const filters = { type, category, from, to };
  const pagination = { page: pageNum, limit: limitNum };

  const result = await recordService.getRecords(filters, pagination);
  return sendSuccess(res, result, 200);
});

const updateRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Whitelist only
  const dataToUpdate = {};
  if (req.body.amount !== undefined) dataToUpdate.amount = req.body.amount;
  if (req.body.type !== undefined) dataToUpdate.type = req.body.type;
  if (req.body.category !== undefined) dataToUpdate.category = req.body.category;
  if (req.body.date !== undefined) dataToUpdate.date = req.body.date;
  if (req.body.notes !== undefined) dataToUpdate.notes = req.body.notes;

  if (Object.keys(dataToUpdate).length === 0) {
    throw new AppError("No valid fields provided to update", 400);
  }

  const parseResult = updateSchema.safeParse(dataToUpdate);
  if (!parseResult.success) {
    throw new ValidationError(parseResult.error.errors[0].message);
  }

  const parsedData = parseResult.data;
  const dbData = {};
  if (parsedData.amount !== undefined) dbData.amount = parsedData.amount;
  if (parsedData.type !== undefined) dbData.type = parsedData.type;
  if (parsedData.category !== undefined) dbData.category = parsedData.category.toLowerCase();
  if (parsedData.date !== undefined) dbData.date = new Date(parsedData.date);
  if (parsedData.notes !== undefined) dbData.notes = parsedData.notes;

  const updatedRecord = await recordService.updateRecord(id, dbData);

  await auditService.logAction({
    action: "updated",
    resource: "record",
    resourceId: updatedRecord.id,
    performedBy: req.user.id
  });

  return sendSuccess(res, updatedRecord, 200);
});

const deleteRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await recordService.deleteRecord(id);

  await auditService.logAction({
    action: "deleted",
    resource: "record",
    resourceId: id,
    performedBy: req.user.id
  });

  return sendSuccess(res, result, 200);
});

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
};
