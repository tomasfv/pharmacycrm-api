import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import sequelize from "./config/database";
import { User } from "./models";
import app from "./app";
import seed from "./scripts/seed";

const PORT = process.env.PORT || 4000;

async function bootstrap(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    await sequelize.sync({ force: true });
    console.log("Models synchronized (force).");

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

    await seed();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
}

bootstrap();
