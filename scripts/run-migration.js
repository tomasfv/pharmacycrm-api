require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Sequelize } = require('sequelize');

const dbUrl = process.env.DB_DEPLOY;
const sequelize = dbUrl
  ? new Sequelize(dbUrl, { dialect: 'postgres', dialectOptions: { ssl: { rejectUnauthorized: false } }, logging: false })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      dialect: 'postgres',
      logging: false,
    });

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const [results] = await sequelize.query(
      "SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_follow_ups_status'"
    );
    const values = results.map(r => r.enumlabel);
    console.log('Current ENUM values:', values);

    if (values.includes('cancelled')) {
      console.log('Value "cancelled" already exists. No migration needed.');
    } else {
      await sequelize.query("ALTER TYPE \"enum_follow_ups_status\" ADD VALUE 'cancelled'");
      console.log('Added "cancelled" successfully.');
    }

    const [after] = await sequelize.query(
      "SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'enum_follow_ups_status'"
    );
    console.log('Final ENUM values:', after.map(r => r.enumlabel));
    console.log('Migration complete. No records were deleted.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sequelize.close();
  }
})();
