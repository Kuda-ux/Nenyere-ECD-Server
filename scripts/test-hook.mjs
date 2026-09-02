import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Get the admin user ID
  const { rows: users } = await client.query(
    "SELECT id FROM auth.users WHERE email = 'admin@nenyere.edu'"
  );
  
  if (users.length === 0) {
    console.log("No admin user found!");
    await client.end();
    return;
  }
  
  const userId = users[0].id;
  console.log("Testing hook with user_id:", userId);

  // Test the hook exactly as GoTrue would call it
  console.log("\n=== Testing custom_access_token_hook ===");
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
    `, [userId]);
    console.log("Hook result:", JSON.stringify(rows[0].result, null, 2));
  } catch (err) {
    console.error("Hook error:", err.message);
    console.error("Full error:", err);
  }

  // Also check if the function has the right signature
  console.log("\n=== Function details ===");
  const { rows: funcDetails } = await client.query(`
    SELECT 
      n.nspname as schema,
      p.proname as name,
      pg_get_function_arguments(p.oid) as args,
      pg_get_function_result(p.oid) as result,
      p.prosecdef as security_definer,
      l.lanname as language
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE p.proname = 'custom_access_token_hook'
  `);
  funcDetails.forEach(f => console.log(JSON.stringify(f, null, 2)));

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
