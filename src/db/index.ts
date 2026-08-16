import "server-only";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";
import * as relationSchema from "./relations";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
  connectionLimit: 10,
});

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relationSchema,
  },
  mode: "default",
});
