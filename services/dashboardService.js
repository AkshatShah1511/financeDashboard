const prisma = require("../config/db");

const getSummary = async () => {
  // Using queryRaw to strictly follow the COALESCE requirement
  const result = await prisma.$queryRaw`
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS totalIncome,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
    FROM Record
    WHERE isDeleted = false OR isDeleted = 0
  `;

  // Prisma returns an array for queryRaw
  const totalIncome = result[0]?.totalIncome ? Number(result[0].totalIncome) : 0;
  const totalExpense = result[0]?.totalExpense ? Number(result[0].totalExpense) : 0;
  const netBalance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, netBalance };
};

const getByCategory = async () => {
  // Using queryRaw
  const result = await prisma.$queryRaw`
    SELECT 
      category, 
      type, 
      COALESCE(SUM(amount), 0) AS total
    FROM Record
    WHERE isDeleted = false OR isDeleted = 0
    GROUP BY category, type
  `;

  // Map result to ensure correct types (Prisma might return BigInt or numbers from SQLite SUM)
  return result.map(row => ({
    category: row.category,
    type: row.type,
    total: Number(row.total)
  }));
};

const getTrends = async () => {
  // SQLite strftime for month, grouped by month
  const result = await prisma.$queryRaw`
    SELECT 
      strftime('%Y-%m', date / 1000, 'unixepoch') AS month,
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
    FROM Record
    WHERE isDeleted = false OR isDeleted = 0
    GROUP BY month
    ORDER BY month ASC
  `;

  return result.map(row => ({
    month: row.month,
    income: Number(row.income),
    expense: Number(row.expense)
  }));
};

module.exports = {
  getSummary,
  getByCategory,
  getTrends
};
