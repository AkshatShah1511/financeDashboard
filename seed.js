const prisma = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    // 1. Clear existing data
    await prisma.auditLog.deleteMany({});
    await prisma.record.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Create users
    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        status: "active"
      }
    });

    const analyst = await prisma.user.create({
      data: {
        name: "Analyst User",
        email: "analyst@test.com",
        password: hashedPassword,
        role: "analyst",
        status: "active"
      }
    });

    const viewer = await prisma.user.create({
      data: {
        name: "Viewer User",
        email: "viewer@test.com",
        password: hashedPassword,
        role: "viewer",
        status: "active"
      }
    });

    // 3. Create 20 realistic financial records
    const categories = {
      income: ["salary", "freelance"],
      expense: ["food", "rent", "transport", "utilities"]
    };

    const records = [];
    
    // Generate dates spread across last 6 months
    const dateNow = new Date();
    
    for (let i = 0; i < 20; i++) {
        const isIncome = i % 3 === 0; // Roughly 1/3 income, 2/3 expense
        const type = isIncome ? "income" : "expense";
        const categoryList = isIncome ? categories.income : categories.expense;
        const category = categoryList[i % categoryList.length];
        
        let amount = 0;
        if (category === "salary") amount = 5000 + Math.random() * 1000;
        else if (category === "freelance") amount = 500 + Math.random() * 1500;
        else if (category === "rent") amount = 1500;
        else if (category === "food") amount = 20 + Math.random() * 80;
        else if (category === "utilities") amount = 100 + Math.random() * 100;
        else amount = 15 + Math.random() * 50;

        amount = Number(amount.toFixed(2));

        const randomDaysAgo = Math.floor(Math.random() * 180); // Up to 6 months ago
        const recordDate = new Date();
        recordDate.setDate(dateNow.getDate() - randomDaysAgo);

        records.push({
            amount,
            type,
            category: category.toLowerCase(),
            date: recordDate,
            notes: `Auto-generated ${category} record`,
            createdBy: admin.id // Assigning all to admin for simplicity
        });
    }

    // Insert records one by one
    for (const data of records) {
        await prisma.record.create({ data });
    }

    console.log("Database seeded successfully");
    console.log("Admin: admin@test.com / 123456");
    console.log("Analyst: analyst@test.com / 123456");
    console.log("Viewer: viewer@test.com / 123456");

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
