import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Check auth config table
  console.log("=== Checking auth config tables ===");
  
  // Try different possible table names
  for (const table of ["auth.config", "auth.mfa_factors", "pg_settings"]) {
    try {
      const { rows } = await client.query(`SELECT * FROM ${table} LIMIT 5`);
      if (table === "pg_settings") {
        const filtered = rows.filter(r => r.name && r.name.includes("jwt"));
        console.log(`\n${table} (jwt-related):`, filtered);
      } else {
        console.log(`\n${table}:`, rows);
      }
    } catch (err) {
      console.log(`\n${table}: ${err.message}`);
    }
  }

  // Check for the hook in pg_proc
  console.log("\n=== Checking custom_access_token_hook exists ===");
  const { rows: funcs } = await client.query(`
    SELECT proname, prosrc, pg_get_function_arguments(oid) as args
    FROM pg_proc
    WHERE proname = 'custom_access_token_hook'
  `);
  console.log("Functions found:", funcs.length);
  funcs.forEach(f => console.log(`  ${f.proname}(${f.args})`));

  // Check if there's a config for the hook
  console.log("\n=== Checking for hook configuration ===");
  try {
    const { rows: settings } = await client.query(`
      SELECT name, setting, source 
      FROM pg_settings 
      WHERE name LIKE '%hook%' OR name LIKE '%jwt%' OR name LIKE '%token%'
      ORDER BY name
    `);
    settings.forEach(s => console.log(`  ${s.name} = ${s.setting} (${s.source})`));
  } catch (err) {
    console.log("Error:", err.message);
  }

  // Try to find the auth config in the supabase admin schema
  console.log("\n=== Checking supabase admin schema ===");
  try {
    const { rows: schemas } = await client.query(`
      SELECT schema_name FROM information_schema.schemata 
      WHERE schema_name LIKE '%auth%' OR schema_name LIKE '%supabase%'
    `);
    schemas.forEach(s => console.log(`  Schema: ${s.schema_name}`));
  } catch (err) {
    console.log("Error:", err.message);
  }

  // Check tables in auth schema
  console.log("\n=== Tables in auth schema ===");
  try {
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'auth'
      ORDER BY table_name
    `);
    tables.forEach(t => console.log(`  ${t.table_name}`));
  } catch (err) {
    console.log("Error:", err.message);
  }

  // Check if there's a config table
  console.log("\n=== Checking auth.config table ===");
  try {
    const { rows: config } = await client.query(`
      SELECT * FROM auth.config
    `);
    console.log("Config rows:", config.length);
    if (config.length > 0) {
      // Look for hook-related config
      const keys = Object.keys(config[0]);
      const hookKeys = keys.filter(k => k.includes('hook') || k.includes('token') || k.includes('jwt'));
      console.log("Hook/token related keys:", hookKeys);
      hookKeys.forEach(k => console.log(`  ${k} = ${config[0][k]}`));
    }
  } catch (err) {
    console.log("Error:", err.message);
  }

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
