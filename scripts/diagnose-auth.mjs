import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // 1. Check if auth user exists
  console.log("=== Checking auth.users ===");
  const { rows: users } = await client.query(
    "SELECT id, email, email_confirmed_at, created_at, raw_user_meta_data FROM auth.users WHERE email = $1",
    ["admin@nenyere.edu"]
  );
  console.log("Users found:", users.length);
  users.forEach(u => console.log(JSON.stringify(u, null, 2)));

  // 2. Check profiles
  console.log("\n=== Checking profiles ===");
  const { rows: profiles } = await client.query(
    "SELECT * FROM public.profiles"
  );
  console.log("Profiles:", profiles.length);
  profiles.forEach(p => console.log(JSON.stringify(p)));

  // 3. Check memberships
  console.log("\n=== Checking memberships ===");
  const { rows: memberships } = await client.query(
    "SELECT * FROM public.memberships"
  );
  console.log("Memberships:", memberships.length);
  memberships.forEach(m => console.log(JSON.stringify(m)));

  // 4. Check schools
  console.log("\n=== Checking schools ===");
  const { rows: schools } = await client.query(
    "SELECT id, name, slug FROM public.schools"
  );
  console.log("Schools:", schools.length);
  schools.forEach(s => console.log(JSON.stringify(s)));

  // 5. Check triggers on auth.users
  console.log("\n=== Triggers on auth.users ===");
  const { rows: triggers } = await client.query(`
    SELECT tgname, tgtype, tgenabled, pg_get_triggerdef(oid) as definition
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
  `);
  triggers.forEach(t => console.log(`${t.tgname}: ${t.definition}`));

  // 6. Check if custom_access_token_hook is registered
  console.log("\n=== Auth config ===");
  const { rows: config } = await client.query(`
    SELECT name, value FROM auth.config 
    WHERE name LIKE '%hook%' OR name LIKE '%token%'
  `);
  config.forEach(c => console.log(`${c.name}: ${c.value}`));

  // 7. Try calling the hook manually
  if (users.length > 0) {
    console.log("\n=== Testing custom_access_token_hook ===");
    try {
      const { rows: hookResult } = await client.query(`
        SELECT app.custom_access_token_hook(
          jsonb_build_object(
            'event', jsonb_build_object(
              'user_id', '${users[0].id}',
              'claims', '{}'::jsonb
            )
          )
        ) as result
      `);
      console.log("Hook result:", JSON.stringify(hookResult[0].result, null, 2));
    } catch (err) {
      console.error("Hook error:", err.message);
    }
  }

  // 8. Check handle_new_user function
  console.log("\n=== handle_new_user function ===");
  try {
    const { rows: funcDef } = await client.query(`
      SELECT pg_get_functiondef('public.handle_new_user()'::regprocedure) as definition
    `);
    console.log(funcDef[0].definition);
  } catch (err) {
    console.error("Error getting function:", err.message);
  }

  await client.end();
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
