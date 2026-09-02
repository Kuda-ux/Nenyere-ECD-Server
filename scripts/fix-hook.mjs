import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Apply the fixed migration 0006
  const sql = fs.readFileSync(
    path.join(projectRoot, "supabase", "migrations", "0006_governance.sql"),
    "utf8"
  );
  
  console.log("Applying fixed 0006_governance.sql...");
  try {
    await client.query(sql);
    console.log("  ✓ Done");
  } catch (err) {
    console.error("  ✗ Error:", err.message);
  }

  // Test the hook again
  const { rows: users } = await client.query(
    "SELECT id FROM auth.users WHERE email = 'admin@nenyere.edu'"
  );
  
  if (users.length > 0) {
    console.log("\n=== Testing fixed hook ===");
    try {
      const { rows } = await client.query(`
        SELECT app.custom_access_token_hook(
          jsonb_build_object(
            'event', jsonb_build_object(
              'user_id', $1::text,
              'claims', '{}'::jsonb
            )
          )
        ) as result
      `, [users[0].id]);
      console.log("Hook result:", JSON.stringify(rows[0].result, null, 2));
      console.log("✅ Hook works! Login should now work.");
    } catch (err) {
      console.error("Hook still fails:", err.message);
    }
  }

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
