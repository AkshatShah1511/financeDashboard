const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  return sendSuccess(res, summary, 200);
});

const getByCategory = asyncHandler(async (req, res) => {
  const data = await dashboardService.getByCategory();
  return sendSuccess(res, data, 200);
});

const getTrends = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTrends();
  return sendSuccess(res, data, 200);
});

module.exports = {
  getSummary,
  getByCategory,
  getTrends
};
