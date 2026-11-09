import "dotenv/config";
import mysql from "mysql2/promise";

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);

  // Tables
  const [tables] = await conn.query("SHOW TABLES") as any;
  const tableNames: string[] = tables.map((r: any) => Object.values(r)[0] as string).sort();
  console.log("=== TABLES ===");
  console.log(tableNames.join(", "));

  // shipping_providers content
  const [sp] = await conn.query("SELECT * FROM shipping_providers LIMIT 10") as any;
  console.log("\n=== shipping_providers rows ===");
  console.log(sp.length === 0 ? "(empty)" : JSON.stringify(sp, null, 2));

  // settings content
  const [settings] = await conn.query("SELECT * FROM settings") as any;
  console.log("\n=== settings rows ===");
  console.log(settings.length === 0 ? "(empty)" : settings.map((r: any) => `${r.key} = ${r.value}`).join("\n"));

  // users columns
  const [ucols] = await conn.query("DESCRIBE users") as any;
  console.log("\n=== users columns ===");
  console.log(ucols.map((c: any) => c.Field).join(", "));

  // orders columns (dropship)
  const [ocols] = await conn.query("DESCRIBE orders") as any;
  console.log("\n=== orders columns ===");
  console.log(ocols.map((c: any) => c.Field).join(", "));

  // product_variants columns
  const [pvcols] = await conn.query("DESCRIBE product_variants") as any;
  console.log("\n=== product_variants columns ===");
  console.log(pvcols.map((c: any) => c.Field).join(", "));

  // payments columns
  const [paycols] = await conn.query("DESCRIBE payments") as any;
  console.log("\n=== payments columns ===");
  console.log(paycols.map((c: any) => c.Field).join(", "));

  await conn.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
