import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const userEmail = "admin@nenyere.edu";
  const userPassword = "Nenyere2025!";
  const schoolId = "00000000-0000-0000-0000-000000000001";

  // 1. Delete the broken user completely
  console.log("=== Cleaning up existing user ===");
  await client.query("DELETE FROM auth.users WHERE email = $1", [userEmail]);
  console.log("Deleted old user");

  // 2. Create user properly with all required auth tables
  console.log("\n=== Creating user properly ===");
  const { rows } = await client.query(`
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      last_sign_in_at, phone, phone_confirmed_at,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_confirm_status,
      banned_until, reauthentication_token, is_sso_user, deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      $1,
      crypt($2, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"display_name":"School Administrator"}'::jsonb,
      null, null, null,
      '', '', '', '', 0,
      null, '', false, null
    )
    RETURNING id, email;
  `, [userEmail, userPassword]);

  const userId = rows[0].id;
  console.log(`Created auth user: ${userEmail} (id: ${userId})`);

  // 3. Create auth.identities entry (GoTrue requires this)
  console.log("\n=== Creating auth.identities entry ===");
  const userIdStr = String(userId);
  await client.query(`
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      $1::uuid,
      jsonb_build_object('sub', $2::text, 'email', $3::text, 'email_verified', true),
      'email',
      $2::text,
      now(),
      now(),
      now()
    );
  `, [userId, userIdStr, userEmail]);
  console.log("Created auth.identities entry");

  // 4. Wait for trigger to create profile, then verify
  console.log("\n=== Checking profile (trigger-created) ===");
  const { rows: profiles } = await client.query(
    "SELECT * FROM public.profiles WHERE id = $1", [userId]
  );
  if (profiles.length === 0) {
    console.log("Profile not auto-created, creating manually...");
    await client.query(
      "INSERT INTO public.profiles (id, display_name) VALUES ($1, 'School Administrator') ON CONFLICT DO NOTHING",
      [userId]
    );
    console.log("Profile created");
  } else {
    console.log("Profile auto-created by trigger ✓");
  }

  // 5. Create school admin membership
  console.log("\n=== Creating membership ===");
  await client.query(`
    INSERT INTO public.memberships (user_id, school_id, role, is_active)
    VALUES ($1, $2, 'SCHOOL_ADMIN', true)
    ON CONFLICT (user_id, school_id) DO NOTHING;
  `, [userId, schoolId]);
  console.log("Membership created ✓");

  // 6. Verify everything
  console.log("\n=== Verification ===");
  const { rows: userCheck } = await client.query(
    "SELECT id, email, email_confirmed_at FROM auth.users WHERE email = $1", [userEmail]
  );
  console.log("Auth user:", userCheck[0]);

  const { rows: identCheck } = await client.query(
    "SELECT id, provider, identity_data FROM auth.identities WHERE user_id = $1", [userId]
  );
  console.log("Identity:", identCheck[0]);

  const { rows: profileCheck } = await client.query(
    "SELECT * FROM public.profiles WHERE id = $1", [userId]
  );
  console.log("Profile:", profileCheck[0]);

  const { rows: memberCheck } = await client.query(
    "SELECT * FROM public.memberships WHERE user_id = $1", [userId]
  );
  console.log("Membership:", memberCheck[0]);

  // 7. Test password verification
  console.log("\n=== Testing password verification ===");
  const { rows: pwCheck } = await client.query(
    "SELECT crypt($1, encrypted_password) = encrypted_password as matches FROM auth.users WHERE email = $2",
    [userPassword, userEmail]
  );
  console.log("Password matches:", pwCheck[0]?.matches);

  // 8. Test the custom_access_token_hook
  console.log("\n=== Testing custom_access_token_hook ===");
  try {
    const { rows: hookResult } = await client.query(`
      SELECT app.custom_access_token_hook(
        jsonb_build_object(
          'event', jsonb_build_object(
            'user_id', $1::text,
            'claims', '{}'::jsonb
          )
        )
      ) as result
    `, [userId]);
    console.log("Hook result:", JSON.stringify(hookResult[0].result, null, 2));
  } catch (err) {
    console.error("Hook error:", err.message);
  }

  await client.end();
  console.log("\n✅ Done! Try logging in now.");
}

main().catch(err => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
