import { createClient } from "@supabase/supabase-js";

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env and fill it in.`);
  return v;
}

let serviceClient = null;
let anonClient = null;

/**
 * Service-role client: bypasses RLS. SERVER ONLY (API routes, server
 * actions). Never import this into a client component.
 */
export function getServiceClient() {
  if (!serviceClient) {
    serviceClient = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serviceClient;
}

/**
 * Anon client: respects RLS policies. Safe for public reads in server
 * components (active/closed polls, candidates, approved villages).
 */
export function getAnonClient() {
  if (!anonClient) {
    anonClient = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return anonClient;
}

export function siteUrl() {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
