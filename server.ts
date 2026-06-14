import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import sequelize from "./config/database";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PharmacyCRM API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);
app.use(errorHandler);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established.");
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("Models synchronized.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: Error) => {
    console.error("Unable to connect to the database:", err);
  });

export default app;
