import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid corporate email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  full_name: z.string().min(2, 'Full name must have at least 2 characters'),
  department: z.enum([
    'Finance',
    'Engineering',
    'Human_Resources',
    'Legal_Compliance',
    'Operations',
    'Product_Strategy'
  ]),
  role: z.enum(['Admin', 'Department_Lead', 'Analyst'])
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const initiativeCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255, 'Title cannot exceed 255 characters'),
  department: z.enum([
    'Finance',
    'Engineering',
    'Human_Resources',
    'Legal_Compliance',
    'Operations',
    'Product_Strategy'
  ]),
  initiative_type: z.enum([
    'Strategic_Roadmap',
    'Budget_Allocation',
    'Policy_Update',
    'Infrastructure_Change',
    'Vendor_Procurement'
  ]),
  budget: z.coerce.number().nonnegative('Budget must be a non-negative amount'),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date in YYYY-MM-DD format'),
  impacted_departments: z.array(z.string()).nonempty('Must select at least one impacted department'),
  summary: z.string().min(30, 'Executive summary must be at least 30 characters').max(2000, 'Executive summary cannot exceed 2000 characters'),
  raw_content: z.string().min(50, 'Detailed proposal context must be at least 50 characters')
});

export const stageUpdateSchema = z.object({
  to_stage: z.enum([
    'Draft',
    'Under_Review',
    'Compliance_Pending',
    'Approved',
    'Rejected',
    'Archived'
  ]),
  notes: z.string().optional()
});

export const aiEvaluationSchema = z.object({
  overall_risk_score: z.number().int().min(1).max(100),
  financial_impact_score: z.number().int().min(1).max(100),
  operational_friction_score: z.number().int().min(1).max(100),
  compliance_risk_score: z.number().int().min(1).max(100),
  strategic_alignment_summary: z.string(),
  cross_departmental_dependencies: z.array(z.object({
    department: z.string(),
    dependency_description: z.string(),
    friction_level: z.enum(['Low', 'Medium', 'High'])
  })),
  identified_bottlenecks: z.array(z.object({
    stage: z.string(),
    description: z.string()
  })),
  recommended_mitigations: z.array(z.object({
    priority: z.enum(['P1', 'P2', 'P3']),
    action_item: z.string()
  })),
  executive_action_verdict: z.enum([
    'Fast_Track_Approval',
    'Standard_Review',
    'Escalate_To_Legal',
    'Require_Budget_Revision',
    'Reject'
  ])
});

export const intelligenceQuerySchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(1000, 'Query cannot exceed 1000 characters'),
  department_filter: z.string().optional()
});

