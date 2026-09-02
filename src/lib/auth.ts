/**
 * Auth helper functions for Server Components and Server Actions.
 * Per security.md §2: use getUser() (validated), never getSession() alone.
 */
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, AppJwtClaims } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile and membership
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: membership } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .single();

  return {
    id: user.id,
    email: user.email,
    profile,
    membership,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: AppRole[]) {
  const user = await requireAuth();
  if (!user.membership || !roles.includes(user.membership.role)) {
    redirect("/unauthorized");
  }
  return user;
}

export function getClaims(membership: {
  role: AppRole;
  school_id: string | null;
  class_ids: string[] | null;
}): AppJwtClaims {
  return {
    app_role: membership.role,
    school_id: membership.school_id,
    class_ids: membership.class_ids,
  };
}
