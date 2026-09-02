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

  console.log("Connecting to Supabase database...");
  await client.connect();
  console.log("Connected!\n");

  const migrationsDir = path.join(projectRoot, "supabase", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Applying ${file}...`);
    try {
      await client.query(sql);
      console.log(`  ✓ Done`);
    } catch (err) {
      const msg = err.message;
      if (msg.includes("already exists") || msg.includes("duplicate_object")) {
        console.log(`  ⚠ Skipped (already exists)`);
      } else {
        console.error(`  ✗ Error: ${msg}`);
        console.error(`  Stopping — fix this migration before continuing.`);
        await client.end();
        process.exit(1);
      }
    }
  }

  // Apply seed data
  const seedPath = path.join(projectRoot, "supabase", "seed.sql");
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, "utf8");
    console.log("\nApplying seed.sql...");
    try {
      await client.query(seedSql);
      console.log("  ✓ Done");
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  // Create admin user via direct insert into auth.users
  console.log("\nCreating admin user...");
  try {
    // Check if user already exists
    const { rows: existing } = await client.query(
      "SELECT id FROM auth.users WHERE email = $1",
      ["admin@nenyere.edu"]
    );

    if (existing.length > 0) {
      console.log("  ✓ Admin user already exists (admin@nenyere.edu)");
    } else {
      // Insert into auth.users directly (Supabase managed table)
      await client.query(`
        INSERT INTO auth.users (
          instance_id, id, aud, role, email, encrypted_password,
          email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          gen_random_uuid(),
          'authenticated',
          'authenticated',
          'admin@nenyere.edu',
          crypt('Nenyere2025!', gen_salt('bf')),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{"display_name":"School Administrator"}'::jsonb
        )
        RETURNING id;
      `);

      // The trigger handle_new_user should auto-create the profile.
      // But let's ensure it exists:
      await client.query(`
        INSERT INTO public.profiles (id, display_name)
        SELECT id, 'School Administrator' FROM auth.users WHERE email = 'admin@nenyere.edu'
        ON CONFLICT (id) DO NOTHING;
      `);

      // Create school admin membership
      await client.query(`
        INSERT INTO public.memberships (user_id, school_id, role, is_active)
        SELECT id, '00000000-0000-0000-0000-000000000001', 'SCHOOL_ADMIN', true
        FROM auth.users WHERE email = 'admin@nenyere.edu'
        ON CONFLICT (user_id, school_id) DO NOTHING;
      `);

      console.log("  ✓ Admin user created (admin@nenyere.edu / Nenyere2025!)");
    }
  } catch (err) {
    console.error(`  ✗ Error creating admin user: ${err.message}`);
  }

  // Verify tables
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(`\n✅ Database has ${rows.length} tables:`);
  rows.forEach((r) => console.log(`   - ${r.table_name}`));

  await client.end();
  console.log("\nDone! Database is ready.");
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
