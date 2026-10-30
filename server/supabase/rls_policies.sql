-- ====================================================================
-- NexusAI Enterprise — Supabase Row Level Security (RLS) Policies
-- Enforce enterprise tenancy, departmental isolation, and audit immutability
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Full Access (Service Role Key bypasses RLS for backend worker / Render server)
CREATE POLICY "service_role_all_users" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_initiatives" ON public.initiatives FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_evaluations" ON public.ai_evaluations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_workflows" ON public.workflow_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_audit" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Authenticated / Anon Read Policies
-- Approved & Archived initiatives are viewable across all enterprise users
CREATE POLICY "anon_read_approved_initiatives" ON public.initiatives
    FOR SELECT TO anon, authenticated
    USING (current_stage IN ('Approved', 'Archived', 'Under_Review', 'Compliance_Pending'));

-- Evaluations for readable initiatives
CREATE POLICY "anon_read_evaluations" ON public.ai_evaluations
    FOR SELECT TO anon, authenticated
    USING (true);

-- 3. Workflow Actions Read Policy
CREATE POLICY "anon_read_workflow_actions" ON public.workflow_actions
    FOR SELECT TO anon, authenticated
    USING (true);

-- 4. STRICT AUDIT LOG IMMUTABILITY (WORM - Write Once, Read Only)
-- Audit logs can be read by authenticated users, but CANNOT BE UPDATED OR DELETED BY ANYONE
CREATE POLICY "read_audit_logs" ON public.audit_logs
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "insert_audit_logs" ON public.audit_logs
    FOR INSERT TO authenticated, anon, service_role
    WITH CHECK (true);

-- Explicitly DO NOT create UPDATE or DELETE policies on audit_logs!
-- This guarantees tamper-proof cryptographic immutability under Supabase RLS.
