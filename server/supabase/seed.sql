-- ====================================================================
-- NexusAI Enterprise — Supabase SQL Seed Script
-- Run directly in Supabase SQL Editor to instantly seed test accounts & initiatives
-- ====================================================================

-- 1. Insert Pre-Seeded Enterprise Users
-- Passwords:
-- Admin: EnterpriseAdmin#2026!
-- Leads: NexusLead#2026!
-- Analysts: NexusAnalyst#2026!

INSERT INTO public.users (id, email, password_hash, full_name, department, role)
VALUES 
  ('a1111111-1111-1111-1111-111111111111', 'admin@nexusai.corp', '$2a$12$R.bVd3/q7c0.q/Vq4rO7.eB9bWd0wX5z7mO3hV9aK0c1.e8f0a2k2', 'Dr. Elena Vance', 'Legal_Compliance', 'Admin'),
  ('b2222222-2222-2222-2222-222222222222', 'marcus.lead@nexusai.corp', '$2a$12$8x1sD7.w1uL0.p1b3r7.eO8nWb0wX5z7mO3hV9aK0c1.e8f0a2k2', 'Marcus Sterling', 'Engineering', 'Department_Lead'),
  ('c3333333-3333-3333-3333-333333333333', 'sophia.finance@nexusai.corp', '$2a$12$8x1sD7.w1uL0.p1b3r7.eO8nWb0wX5z7mO3hV9aK0c1.e8f0a2k2', 'Sophia Chen', 'Finance', 'Department_Lead'),
  ('d4444444-4444-4444-4444-444444444444', 'alex.analyst@nexusai.corp', '$2a$12$5m9sD7.w1uL0.p1b3r7.eO8nWb0wX5z7mO3hV9aK0c1.e8f0a2k2', 'Alex Rivera', 'Engineering', 'Analyst'),
  ('e5555555-5555-5555-5555-555555555555', 'david.ops@nexusai.corp', '$2a$12$5m9sD7.w1uL0.p1b3r7.eO8nWb0wX5z7mO3hV9aK0c1.e8f0a2k2', 'David Kim', 'Operations', 'Analyst')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Core Initiatives
INSERT INTO public.initiatives (
  id, author_id, title, department, initiative_type, budget,
  target_date, impacted_departments, summary, raw_content, current_stage
) VALUES 
  (
    '11111111-aaaa-bbbb-cccc-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'Multi-Region Cloud Infrastructure Migration & SOC2 Type II Hardening',
    'Engineering',
    'Infrastructure_Change',
    850000.00,
    '2027-03-31',
    ARRAY['Finance', 'Legal_Compliance', 'Operations'],
    'Transition legacy single-zone database clusters and microservices to redundant multi-region AWS/GCP architecture while achieving SOC2 Type II compliance controls.',
    'Proposal Scope: Deploy terraformed Kubernetes (EKS/GKE) clusters across us-east and eu-central regions with zero-downtime database replication via PostgreSQL Aurora Multi-Region. Audit requirement: Enforce continuous SIEM logging, immutable AWS S3 Glacier log vaults, and automated vulnerability scanning. Stakeholder obligations: Legal review required for cross-border data transfer impact under GDPR; Finance required for amortized cloud spend forecasting.',
    'Compliance_Pending'
  ),
  (
    '22222222-aaaa-bbbb-cccc-222222222222',
    'a1111111-1111-1111-1111-111111111111',
    'Global Enterprise AI Ethics, IP Indemnification & EU AI Act Governance Policy',
    'Legal_Compliance',
    'Policy_Update',
    140000.00,
    '2026-12-15',
    ARRAY['Engineering', 'Product_Strategy', 'Human_Resources'],
    'Establish binding corporate governance frameworks for generative AI procurement, proprietary data isolation, and automated risk scoring complying with EU AI Act High-Risk standards.',
    'This policy governs all internal software and third-party SaaS deploying Large Language Models or automated decision engines. Mandates: Zero training retention on corporate customer data, deterministic output validation schemas, quarterly algorithmic bias audits, and mandatory human-in-the-loop sign-off for critical corporate memos.',
    'Approved'
  ),
  (
    '33333333-aaaa-bbbb-cccc-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'Enterprise ERP Modernization & Automated Billing Reconciliation Engine',
    'Finance',
    'Vendor_Procurement',
    1450000.00,
    '2027-06-30',
    ARRAY['Engineering', 'Operations', 'Legal_Compliance'],
    'Retire legacy on-prem SAP installation and deploy modern cloud ERP suite to automate multi-currency revenue recognition and audit compliance.',
    'Current manual ledger reconciliations create a 12-day close lag at quarter end. The new solution will ingest Stripe, ACH, and Wire transactions directly into automated double-entry ledger accounts with real-time discrepancy alerts. Requires API integration from Engineering and vendor security review from Legal.',
    'Under_Review'
  ),
  (
    '44444444-aaaa-bbbb-cccc-444444444444',
    'd4444444-4444-4444-4444-444444444444',
    'Zero-Trust Internal Developer Portal & Identity Access Orchestration',
    'Engineering',
    'Strategic_Roadmap',
    280000.00,
    '2026-11-30',
    ARRAY['Legal_Compliance', 'Operations'],
    'Centralize internal developer tooling, ephemeral AWS credential provisioning, and secret rotation with biometric MFA and role-scoped permissions.',
    'Engineering velocity is currently hindered by fragmented credential ticketing. The Internal Developer Portal (Backstage-based) will automate access grants via short-lived OIDC tokens tied to active Okta sessions, reducing privilege escalation attack vectors.',
    'Draft'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert AI Risk Evaluations
INSERT INTO public.ai_evaluations (
  initiative_id, overall_risk_score, financial_impact_score,
  operational_friction_score, compliance_risk_score, strategic_alignment_summary,
  cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
  executive_action_verdict, model_version
) VALUES
  (
    '11111111-aaaa-bbbb-cccc-111111111111',
    74, 68, 79, 82,
    'Highly strategic infrastructure resiliency initiative essential for SLA uptime and SOC2 compliance, but presents significant operational friction due to multi-region data synchronization and GDPR cross-border transfer constraints.',
    '[{"department": "Legal_Compliance", "friction_level": "High", "dependency_description": "Cross-border data privacy review and GDPR standard contractual clauses (SCC) verification for EU cluster replication."}, {"department": "Finance", "friction_level": "Medium", "dependency_description": "Amortization schedule for multi-region cloud egress costs and committed use discounts (CUD)."}, {"department": "Operations", "friction_level": "Medium", "dependency_description": "24/7 on-call runbook handoff and incident response simulation testing."}]'::jsonb,
    '[{"stage": "Compliance & Legal Verification", "description": "Unresolved EU-to-US data sovereignty clauses may delay replication pipeline cutover by 3-4 weeks."}, {"stage": "Cutover Maintenance Window", "description": "Legacy database migration requires planned 30-minute read-only freeze affecting global operations."}]'::jsonb,
    '[{"priority": "P1", "action_item": "Engage external privacy counsel to finalize Standard Contractual Clauses before activating EU regional nodes."}, {"priority": "P2", "action_item": "Implement dual-write replication testing in staging for 14 days prior to production traffic switchover."}, {"priority": "P3", "action_item": "Establish automated cloud budget anomaly alerts with strict spend caps in GCP/AWS console."}]'::jsonb,
    'Escalate_To_Legal',
    'gemini-2.5-flash'
  ),
  (
    '22222222-aaaa-bbbb-cccc-222222222222',
    28, 22, 35, 24,
    'Critical enterprise governance policy mitigating existential legal and copyright liability under upcoming EU AI Act enforcement. Implementation cost is minimal relative to corporate risk mitigation value.',
    '[{"department": "Engineering", "friction_level": "Medium", "dependency_description": "Enforce programmatic PII filtering and audit logging across all LLM inference gateway routes."}, {"department": "Human_Resources", "friction_level": "Low", "dependency_description": "Incorporate mandatory employee AI acceptable use training module into annual compliance onboarding."}]'::jsonb,
    '[{"stage": "Engineering Gateway Enforcement", "description": "Legacy internal microservices calling external AI endpoints directly need centralized proxy routing."}]'::jsonb,
    '[{"priority": "P1", "action_item": "Deploy centralized API gateway proxy enforcing strict zero-retention headers on all LLM requests."}, {"priority": "P2", "action_item": "Publish approved AI tool directory on enterprise intranet with designated evaluation tier ratings."}]'::jsonb,
    'Fast_Track_Approval',
    'gemini-2.5-flash'
  )
ON CONFLICT (initiative_id) DO NOTHING;

-- 4. Initial Audit Logs
INSERT INTO public.audit_logs (actor_id, action_type, entity_type, entity_id, metadata)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    'SYSTEM_INITIALIZATION',
    'System',
    'a1111111-1111-1111-1111-111111111111',
    '{"message": "NexusAI Enterprise initialized on Supabase PostgreSQL engine."}'::jsonb
  );
