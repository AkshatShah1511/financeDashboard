const prisma = require("../config/db");
const { NotFoundError } = require("../utils/errors");

const createRecord = async (data) => {
  return await prisma.record.create({
    data
  });
};

const getRecords = async (filters, pagination) => {
  const { type, category, from, to } = filters;
  const { page, limit } = pagination;

  const where = { isDeleted: false };

  if (type) where.type = type;
  if (category) where.category = category.toLowerCase();
  
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" }
    }),
    prisma.record.count({ where })
  ]);

  return { records, total, page, limit };
};

const updateRecord = async (id, data) => {
  const existingRecord = await prisma.record.findFirst({
    where: { id, isDeleted: false }
  });

  if (!existingRecord) {
    throw new NotFoundError("Record not found");
  }

  return await prisma.record.update({
    where: { id },
    data
  });
};

const deleteRecord = async (id) => {
  const existingRecord = await prisma.record.findFirst({
    where: { id, isDeleted: false }
  });

  if (!existingRecord) {
    throw new NotFoundError("Record not found");
  }

  await prisma.record.update({
    where: { id },
    data: { isDeleted: true }
  });

  return { message: "Record deleted successfully" };
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
};
