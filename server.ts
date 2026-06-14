import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import sequelize from "./config/database";
import { User } from "./models";
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

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    await sequelize.sync({ alter: false });
    console.log("Models synchronized.");

    const userCount = await User.count();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash("PharmaCare2026", 10);
      await User.create({
        name: "Admin",
        email: "admin@pharmacare.com",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Default admin user created.");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
}

bootstrap();

export default app;
