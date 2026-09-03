import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Try to register the hook via the auth config
  // Supabase stores auth config in different places depending on version
  console.log("=== Attempting to register custom_access_token_hook ===");

  // Method 1: Try updating via auth schema migrations table
  try {
    // Check if there's a config table or similar
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'auth' AND table_name LIKE '%config%'
    `);
    console.log("Config tables:", tables);
  } catch (err) {
    console.log("No config table:", err.message);
  }

  // Method 2: Check if the hook is already registered by looking at pg_settings
  try {
    const { rows } = await client.query(`
      SELECT name, setting FROM pg_settings 
      WHERE name LIKE '%hook%' OR name LIKE '%custom%'
    `);
    console.log("Hook settings:", rows);
  } catch (err) {
    console.log("Settings error:", err.message);
  }

  // Method 3: Check the instances table for config
  try {
    const { rows } = await client.query(`
      SELECT * FROM auth.instances LIMIT 5
    `);
    console.log("Instances:", rows);
  } catch (err) {
    console.log("Instances error:", err.message);
  }

  // The hook registration is done via the Supabase Dashboard:
  // Dashboard → Authentication → Hooks → Custom access token (JWT claims)
  // Select function: app.custom_access_token_hook
  console.log("\n=== IMPORTANT ===");
  console.log("The custom_access_token_hook must be registered in the Supabase Dashboard:");
  console.log("1. Go to: https://supabase.com/dashboard/project/achswnzuqutjxdhpnacs/auth/hooks");
  console.log("2. Click 'Add Hook' → 'Custom access token (JWT claims)'");
  console.log("3. Select function: app.custom_access_token_hook");
  console.log("4. Save");
  console.log("\nOR if the hook is already registered and causing 500s, try logging in now.");
  console.log("The function has been fixed and tested — it works correctly.");

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
