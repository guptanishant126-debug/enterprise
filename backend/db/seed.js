import bcrypt from 'bcryptjs';
import db from '../src/config/db.js';

export async function seedDatabaseIfEmpty() {
  try {
    const { rows: existingUsers } = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(existingUsers[0]?.count || 0, 10);

    if (userCount > 0) {
      console.log(`ℹ️ [DB Seed] Database already contains ${userCount} users. Skipping initial seed.`);
      return;
    }

    console.log('🌱 [DB Seed] Populating database with enterprise initial dataset...');

    const saltRounds = 12;
    const adminPassHash = await bcrypt.hash('EnterpriseAdmin#2026!', saltRounds);
    const leadPassHash = await bcrypt.hash('NexusLead#2026!', saltRounds);
    const analystPassHash = await bcrypt.hash('NexusAnalyst#2026!', saltRounds);

    // 1. Create Users
    const users = [
      {
        email: 'admin@nexusai.corp',
        password_hash: adminPassHash,
        full_name: 'Dr. Elena Vance',
        department: 'Legal_Compliance',
        role: 'Admin'
      },
      {
        email: 'marcus.lead@nexusai.corp',
        password_hash: leadPassHash,
        full_name: 'Marcus Sterling',
        department: 'Engineering',
        role: 'Department_Lead'
      },
      {
        email: 'sophia.finance@nexusai.corp',
        password_hash: leadPassHash,
        full_name: 'Sophia Chen',
        department: 'Finance',
        role: 'Department_Lead'
      },
      {
        email: 'alex.analyst@nexusai.corp',
        password_hash: analystPassHash,
        full_name: 'Alex Rivera',
        department: 'Engineering',
        role: 'Analyst'
      },
      {
        email: 'david.ops@nexusai.corp',
        password_hash: analystPassHash,
        full_name: 'David Kim',
        department: 'Operations',
        role: 'Analyst'
      }
    ];

    const insertedUsers = [];
    for (const u of users) {
      const res = await db.query(
        `INSERT INTO users (email, password_hash, full_name, department, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [u.email, u.password_hash, u.full_name, u.department, u.role]
      );
      insertedUsers.push(res.rows[0]);
    }

    const admin = insertedUsers[0];
    const engLead = insertedUsers[1];
    const finLead = insertedUsers[2];
    const engAnalyst = insertedUsers[3];

    // 2. Create Initiatives
    const initiativesData = [
      {
        author_id: engLead.id,
        title: 'Multi-Region Cloud Infrastructure Migration & SOC2 Type II Hardening',
        department: 'Engineering',
        initiative_type: 'Infrastructure_Change',
        budget: 850000.00,
        target_date: '2027-03-31',
        impacted_departments: ['Finance', 'Legal_Compliance', 'Operations'],
        summary: 'Transition legacy single-zone database clusters and microservices to redundant multi-region AWS/GCP architecture while achieving SOC2 Type II compliance controls.',
        raw_content: 'Proposal Scope: Deploy terraformed Kubernetes (EKS/GKE) clusters across us-east and eu-central regions with zero-downtime database replication via PostgreSQL Aurora Multi-Region. Audit requirement: Enforce continuous SIEM logging, immutable AWS S3 Glacier log vaults, and automated vulnerability scanning. Stakeholder obligations: Legal review required for cross-border data transfer impact under GDPR; Finance required for amortized cloud spend forecasting.',
        current_stage: 'Compliance_Pending'
      },
      {
        author_id: admin.id,
        title: 'Global Enterprise AI Ethics, IP Indemnification & EU AI Act Governance Policy',
        department: 'Legal_Compliance',
        initiative_type: 'Policy_Update',
        budget: 140000.00,
        target_date: '2026-12-15',
        impacted_departments: ['Engineering', 'Product_Strategy', 'Human_Resources'],
        summary: 'Establish binding corporate governance frameworks for generative AI procurement, proprietary data isolation, and automated risk scoring complying with EU AI Act High-Risk standards.',
        raw_content: 'This policy governs all internal software and third-party SaaS deploying Large Language Models or automated decision engines. Mandates: Zero training retention on corporate customer data, deterministic output validation schemas, quarterly algorithmic bias audits, and mandatory human-in-the-loop sign-off for critical corporate memos.',
        current_stage: 'Approved'
      },
      {
        author_id: finLead.id,
        title: 'Enterprise ERP Modernization & Automated Billing Reconciliation Engine',
        department: 'Finance',
        initiative_type: 'Vendor_Procurement',
        budget: 1450000.00,
        target_date: '2027-06-30',
        impacted_departments: ['Engineering', 'Operations', 'Legal_Compliance'],
        summary: 'Retire legacy on-prem SAP installation and deploy modern cloud ERP suite to automate multi-currency revenue recognition and audit compliance.',
        raw_content: 'Current manual ledger reconciliations create a 12-day close lag at quarter end. The new solution will ingest Stripe, ACH, and Wire transactions directly into automated double-entry ledger accounts with real-time discrepancy alerts. Requires API integration from Engineering and vendor security review from Legal.',
        current_stage: 'Under_Review'
      },
      {
        author_id: engAnalyst.id,
        title: 'Zero-Trust Internal Developer Portal & Identity Access Orchestration',
        department: 'Engineering',
        initiative_type: 'Strategic_Roadmap',
        budget: 280000.00,
        target_date: '2026-11-30',
        impacted_departments: ['Legal_Compliance', 'Operations'],
        summary: 'Centralize internal developer tooling, ephemeral AWS credential provisioning, and secret rotation with biometric MFA and role-scoped permissions.',
        raw_content: 'Engineering velocity is currently hindered by fragmented credential ticketing. The Internal Developer Portal (Backstage-based) will automate access grants via short-lived OIDC tokens tied to active Okta sessions, reducing privilege escalation attack vectors.',
        current_stage: 'Draft'
      }
    ];

    const insertedInitiatives = [];
    for (const item of initiativesData) {
      const res = await db.query(
        `INSERT INTO initiatives (
          author_id, title, department, initiative_type, budget,
          target_date, impacted_departments, summary, raw_content, current_stage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          item.author_id,
          item.title,
          item.department,
          item.initiative_type,
          item.budget,
          item.target_date,
          item.impacted_departments,
          item.summary,
          item.raw_content,
          item.current_stage
        ]
      );
      insertedInitiatives.push(res.rows[0]);
    }

    // 3. Create AI Evaluations
    const evaluationsData = [
      {
        initiative_id: insertedInitiatives[0].id,
        overall_risk_score: 74,
        financial_impact_score: 68,
        operational_friction_score: 79,
        compliance_risk_score: 82,
        strategic_alignment_summary: 'Highly strategic infrastructure resiliency initiative essential for SLA uptime and SOC2 compliance, but presents significant operational friction due to multi-region data synchronization and GDPR cross-border transfer constraints.',
        cross_departmental_dependencies: [
          {
            department: 'Legal_Compliance',
            dependency_description: 'Cross-border data privacy review and GDPR standard contractual clauses (SCC) verification for EU cluster replication.',
            friction_level: 'High'
          },
          {
            department: 'Finance',
            dependency_description: 'Amortization schedule for multi-region cloud egress costs and committed use discounts (CUD).',
            friction_level: 'Medium'
          },
          {
            department: 'Operations',
            dependency_description: '24/7 on-call runbook handoff and incident response simulation testing.',
            friction_level: 'Medium'
          }
        ],
        identified_bottlenecks: [
          {
            stage: 'Compliance & Legal Verification',
            description: 'Unresolved EU-to-US data sovereignty clauses may delay replication pipeline cutover by 3-4 weeks.'
          },
          {
            stage: 'Cutover Maintenance Window',
            description: 'Legacy database migration requires planned 30-minute read-only freeze affecting global operations.'
          }
        ],
        recommended_mitigations: [
          {
            priority: 'P1',
            action_item: 'Engage external privacy counsel to finalize Standard Contractual Clauses before activating EU regional nodes.'
          },
          {
            priority: 'P2',
            action_item: 'Implement dual-write replication testing in staging for 14 days prior to production traffic switchover.'
          },
          {
            priority: 'P3',
            action_item: 'Establish automated cloud budget anomaly alerts with strict spend caps in GCP/AWS console.'
          }
        ],
        executive_action_verdict: 'Escalate_To_Legal',
        model_version: 'gemini-2.5-flash'
      },
      {
        initiative_id: insertedInitiatives[1].id,
        overall_risk_score: 28,
        financial_impact_score: 22,
        operational_friction_score: 35,
        compliance_risk_score: 24,
        strategic_alignment_summary: 'Critical enterprise governance policy mitigating existential legal and copyright liability under upcoming EU AI Act enforcement. Implementation cost is minimal relative to corporate risk mitigation value.',
        cross_departmental_dependencies: [
          {
            department: 'Engineering',
            dependency_description: 'Enforce programmatic PII filtering and audit logging across all LLM inference gateway routes.',
            friction_level: 'Medium'
          },
          {
            department: 'Human_Resources',
            dependency_description: 'Incorporate mandatory employee AI acceptable use training module into annual compliance onboarding.',
            friction_level: 'Low'
          }
        ],
        identified_bottlenecks: [
          {
            stage: 'Engineering Gateway Enforcement',
            description: 'Legacy internal microservices calling external AI endpoints directly need centralized proxy routing.'
          }
        ],
        recommended_mitigations: [
          {
            priority: 'P1',
            action_item: 'Deploy centralized API gateway proxy enforcing strict zero-retention headers on all LLM requests.'
          },
          {
            priority: 'P2',
            action_item: 'Publish approved AI tool directory on enterprise intranet with designated evaluation tier ratings.'
          }
        ],
        executive_action_verdict: 'Fast_Track_Approval',
        model_version: 'gemini-2.5-flash'
      },
      {
        initiative_id: insertedInitiatives[2].id,
        overall_risk_score: 82,
        financial_impact_score: 89,
        operational_friction_score: 75,
        compliance_risk_score: 78,
        strategic_alignment_summary: 'Substantial capital expenditure with mission-critical impact on financial close accuracy. Requires strict vendor SLA commitments, multi-year ROI verification, and change management across all revenue operations.',
        cross_departmental_dependencies: [
          {
            department: 'Finance',
            dependency_description: 'Executive committee capex allocation approval and multi-year amortization modeling.',
            friction_level: 'High'
          },
          {
            department: 'Engineering',
            dependency_description: 'Custom webhook connectors for payment processor data pipelines and automated balance sheet ledger sync.',
            friction_level: 'High'
          }
        ],
        identified_bottlenecks: [
          {
            stage: 'Vendor Contract Negotiations',
            description: 'Enterprise license pricing and indemnification liability caps exceed standard corporate thresholds.'
          }
        ],
        recommended_mitigations: [
          {
            priority: 'P1',
            action_item: 'Tie vendor payment schedule to strict milestone acceptance tests verified by external accounting auditors.'
          },
          {
            priority: 'P2',
            action_item: 'Run parallel ledger runs for two consecutive financial quarters prior to legacy ERP decommission.'
          }
        ],
        executive_action_verdict: 'Require_Budget_Revision',
        model_version: 'gemini-2.5-flash'
      },
      {
        initiative_id: insertedInitiatives[3].id,
        overall_risk_score: 42,
        financial_impact_score: 30,
        operational_friction_score: 48,
        compliance_risk_score: 44,
        strategic_alignment_summary: 'Targeted developer productivity and security initiative with measurable reductions in credential sprawl. Manageable scope and budget with clear operational benefits.',
        cross_departmental_dependencies: [
          {
            department: 'Operations',
            dependency_description: 'IAM role migration and federated SSO directory synchronization.',
            friction_level: 'Low'
          }
        ],
        identified_bottlenecks: [
          {
            stage: 'Developer Onboarding',
            description: 'Initial developer friction adapting to ephemeral token CLI workflows.'
          }
        ],
        recommended_mitigations: [
          {
            priority: 'P1',
            action_item: 'Provide drop-in CLI wrapper scripts maintaining backward compatibility with standard SSH workflows.'
          }
        ],
        executive_action_verdict: 'Standard_Review',
        model_version: 'gemini-2.5-flash'
      }
    ];

    for (const ev of evaluationsData) {
      await db.query(
        `INSERT INTO ai_evaluations (
          initiative_id, overall_risk_score, financial_impact_score,
          operational_friction_score, compliance_risk_score, strategic_alignment_summary,
          cross_departmental_dependencies, identified_bottlenecks, recommended_mitigations,
          executive_action_verdict, model_version, raw_response
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          ev.initiative_id,
          ev.overall_risk_score,
          ev.financial_impact_score,
          ev.operational_friction_score,
          ev.compliance_risk_score,
          ev.strategic_alignment_summary,
          JSON.stringify(ev.cross_departmental_dependencies),
          JSON.stringify(ev.identified_bottlenecks),
          JSON.stringify(ev.recommended_mitigations),
          ev.executive_action_verdict,
          ev.model_version,
          JSON.stringify(ev)
        ]
      );
    }

    // 4. Create Initial Workflow Actions
    await db.query(
      `INSERT INTO workflow_actions (initiative_id, reviewer_id, from_stage, to_stage, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        insertedInitiatives[0].id,
        engLead.id,
        'Draft',
        'Compliance_Pending',
        'Engineering review complete. Escalated to Legal & Compliance per Gemini risk auditor recommendation.'
      ]
    );

    await db.query(
      `INSERT INTO workflow_actions (initiative_id, reviewer_id, from_stage, to_stage, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        insertedInitiatives[1].id,
        admin.id,
        'Under_Review',
        'Approved',
        'Enterprise AI ethics policy ratified by Executive Governance Board. Approved for organization-wide rollout.'
      ]
    );

    // 5. Create Seed Audit Logs
    const auditLogs = [
      {
        actor_id: admin.id,
        action_type: 'SYSTEM_INITIALIZATION',
        entity_type: 'System',
        entity_id: admin.id,
        metadata: { message: 'NexusAI Enterprise platform initialized with hardened RBAC and deterministic schemas.' }
      },
      {
        actor_id: engLead.id,
        action_type: 'INITIATIVE_CREATED',
        entity_type: 'Initiative',
        entity_id: insertedInitiatives[0].id,
        metadata: { title: insertedInitiatives[0].title, budget: 850000 }
      },
      {
        actor_id: null,
        action_type: 'AI_EVALUATION_EXECUTED',
        entity_type: 'Initiative',
        entity_id: insertedInitiatives[0].id,
        metadata: { overall_risk_score: 74, verdict: 'Escalate_To_Legal' }
      },
      {
        actor_id: admin.id,
        action_type: 'WORKFLOW_STAGE_TRANSITIONED',
        entity_type: 'Initiative',
        entity_id: insertedInitiatives[1].id,
        metadata: { from: 'Under_Review', to: 'Approved', reviewer: 'Dr. Elena Vance' }
      }
    ];

    for (const log of auditLogs) {
      await db.query(
        `INSERT INTO audit_logs (actor_id, action_type, entity_type, entity_id, metadata, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [log.actor_id, log.action_type, log.entity_type, log.entity_id, JSON.stringify(log.metadata), '127.0.0.1']
      );
    }

    console.log('✅ [DB Seed] Successfully populated enterprise users, initiatives, AI evaluations, and audit logs.');
  } catch (err) {
    console.error('❌ [DB Seed] Failed to seed database:', err);
  }
}

// Allow direct execution via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await db.initializeDatabase();
    await seedDatabaseIfEmpty();
    process.exit(0);
  })();
}

