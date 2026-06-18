"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.env = {
    supabaseUrl: process.env.SUPABASE_URL ?? '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    triggerSecret: process.env.TRIGGER_SECRET ?? '',
    workerUrl: process.env.WORKER_URL ?? '',
    nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    nextPublicSupabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    // Optional model overrides; worker falls back to MODELS constants when unset
    pipelineModelHeavy: process.env.PIPELINE_MODEL_HEAVY,
    pipelineModelLight: process.env.PIPELINE_MODEL_LIGHT,
};
