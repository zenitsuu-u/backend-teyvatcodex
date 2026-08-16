import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: "postgres",
        host: "teyvat-db",
        database: "teyvat",
        password: "postgres",
        port: 5432,
      }
);

export default pool;