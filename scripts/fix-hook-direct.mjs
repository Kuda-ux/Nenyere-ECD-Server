import pg from "pg";

const connectionString =
  "postgresql://postgres.achswnzuqutjxdhpnacs:-%23c-WRWGS%2BLRHc4@54.247.26.119:5432/postgres";

async function main() {
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log("Applying fixed custom_access_token_hook function...");
  try {
    await client.query(`
      create or replace function app.custom_access_token_hook(event jsonb)
      returns jsonb
      language plpgsql
      security definer
      set search_path = public
      as $$
      declare
        p_user_id uuid;
        claims jsonb;
        membership record;
        p_class_ids uuid[];
      begin
        p_user_id := (event -> 'event' ->> 'user_id')::uuid;

        -- Fetch the first active membership for this user
        select m.role, m.school_id, m.class_ids
        into membership
        from public.memberships m
        where m.user_id = p_user_id
          and m.is_active = true
        order by m.created_at
        limit 1;

        -- If no membership, return the event unchanged
        if not found then
          return event;
        end if;

        -- Build class_ids from teacher_classes if class_ids is null on membership
        if membership.class_ids is not null then
          p_class_ids := membership.class_ids;
        else
          select coalesce(array_agg(tc.class_id), '{}'::uuid[])
          into p_class_ids
          from public.teacher_classes tc
          where tc.membership_id = (
            select m.id from public.memberships m
            where m.user_id = p_user_id and m.is_active = true
            order by m.created_at limit 1
          );
        end if;

        -- Inject claims into the JWT
        claims := jsonb_build_object(
          'app_role', membership.role::text,
          'school_id', membership.school_id::text,
          'class_ids', p_class_ids
        );

        return jsonb_set(
          event,
          '{event,claims}',
          event -> 'event' -> 'claims' || claims
        );
      end;
      $$;
    `);
    console.log("  ✓ Function updated");
  } catch (err) {
    console.error("  ✗ Error:", err.message);
  }

  // Test the hook
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
