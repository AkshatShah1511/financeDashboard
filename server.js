process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})
require("dotenv").config();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
