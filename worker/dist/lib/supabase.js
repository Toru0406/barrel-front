"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceClient = createServiceClient;
exports.createAnonClient = createAnonClient;
const supabase_js_1 = require("@supabase/supabase-js");
// Returns a Supabase client with service_role key (bypasses RLS).
// Server-side and worker only — never expose this key to the browser.
function createServiceClient() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key)
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    return (0, supabase_js_1.createClient)(url, key, { auth: { persistSession: false } });
}
// Returns a Supabase client with anon key for client-side use.
// NEXT_PUBLIC_ vars are inlined by Next.js at build time.
function createAnonClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key)
        throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    return (0, supabase_js_1.createClient)(url, key);
}
