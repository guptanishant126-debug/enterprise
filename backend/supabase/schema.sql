-- ====================================================================
-- NexusAI Enterprise — Supabase Schema (PostgreSQL)
-- Execute in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(50) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('Admin', 'Department_Lead', 'Analyst')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Initiatives Table
CREATE TABLE IF NOT EXISTS public.initiatives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(50) NOT NULL,
    initiative_type VARCHAR(50) NOT NULL,
    budget NUMERIC(15, 2) DEFAULT 0.00,
    target_date DATE NOT NULL,
    impacted_departments TEXT[] NOT NULL,
    summary TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    current_stage VARCHAR(30) NOT NULL DEFAULT 'Draft' CHECK (
        current_stage IN ('Draft', 'Under_Review', 'Compliance_Pending', 'Approved', 'Rejected', 'Archived')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. AI Evaluations Table
CREATE TABLE IF NOT EXISTS public.ai_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID UNIQUE NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
    overall_risk_score INTEGER NOT NULL CHECK (overall_risk_score BETWEEN 1 AND 100),
    financial_impact_score INTEGER NOT NULL CHECK (financial_impact_score BETWEEN 1 AND 100),
    operational_friction_score INTEGER NOT NULL CHECK (operational_friction_score BETWEEN 1 AND 100),
    compliance_risk_score INTEGER NOT NULL CHECK (compliance_risk_score BETWEEN 1 AND 100),
    strategic_alignment_summary TEXT NOT NULL,
    cross_departmental_dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
    identified_bottlenecks JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_mitigations JSONB NOT NULL DEFAULT '[]'::jsonb,
    executive_action_verdict VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL DEFAULT 'gemini-2.5-flash',
    raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Workflow Actions / Approvals Table
CREATE TABLE IF NOT EXISTS public.workflow_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    from_stage VARCHAR(30) NOT NULL,
    to_stage VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enterprise Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_initiatives_dept ON public.initiatives(department);
CREATE INDEX IF NOT EXISTS idx_initiatives_stage ON public.initiatives(current_stage);
CREATE INDEX IF NOT EXISTS idx_ai_evaluations_init ON public.ai_evaluations(initiative_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_init ON public.workflow_actions(initiative_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);

