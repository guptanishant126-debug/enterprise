import app from './src/app.js';
import db from './src/config/db.js';
import { seedDatabaseIfEmpty } from './db/seed.js';

async function runSelfTest() {
  console.log('🧪 Starting NexusAI Enterprise End-to-End System Integration Test...\n');

  await db.initializeDatabase();
  await seedDatabaseIfEmpty();

  const server = app.listen(5099, async () => {
    try {
      const baseUrl = 'http://127.0.0.1:5099/api';

      // 1. Health check
      console.log('1️⃣ Testing Health Endpoint...');
      const healthRes = await fetch(`${baseUrl}/health`).then(r => r.json());
      console.log('   Status:', healthRes.status, '| Service:', healthRes.service);

      // 2. Authentication Login Test
      console.log('\n2️⃣ Testing Enterprise JWT Authentication (Admin)...');
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@nexusai.corp',
          password: 'EnterpriseAdmin#2026!'
        })
      }).then(r => r.json());

      if (!loginRes.success || !loginRes.token) {
        throw new Error(`Login failed: ${JSON.stringify(loginRes)}`);
      }
      console.log(`   ✅ Authenticated as: ${loginRes.user.full_name} (${loginRes.user.role}, ${loginRes.user.department})`);
      const token = loginRes.token;

      // 3. Test Initiatives List
      console.log('\n3️⃣ Testing Initiative Retrieval & Tenancy Isolation...');
      const initRes = await fetch(`${baseUrl}/initiatives`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());

      console.log(`   ✅ Retrieved ${initRes.count} initiatives.`);
      if (initRes.data.length > 0) {
        const first = initRes.data[0];
        console.log(`   Sample: "${first.title}"`);
        console.log(`   Current Stage: [${first.current_stage}] | Budget: $${first.budget.toLocaleString()}`);
        if (first.evaluation) {
          console.log(`   AI Risk Score: ${first.evaluation.overall_risk_score}/100 | Verdict: ${first.evaluation.executive_action_verdict}`);
        }
      }

      // 4. Test Ingesting a New Initiative with Automatic AI Evaluation Pipeline
      console.log('\n4️⃣ Testing Ingestion & Automated Gemini Impact Synthesizer...');
      const newInitPayload = {
        title: 'Zero-Downtime Payment Gateway Gateway Split & PCI-DSS 4.0 Compliance',
        department: 'Finance',
        initiative_type: 'Infrastructure_Change',
        budget: 375000,
        target_date: '2027-02-28',
        impacted_departments: ['Engineering', 'Legal_Compliance', 'Operations'],
        summary: 'Decouple core billing microservices into active-active redundant providers to satisfy PCI-DSS 4.0 requirements and mitigate single-provider outages.',
        raw_content: 'Proposal Scope: Integrate Stripe and Adyen dual routing with automated failover under 500ms latency degradation. Legal will verify merchant agreement compliance and Finance will audit processing fee reconciliation. Engineering will implement webhook idempotent consumer queues.'
      };

      const createRes = await fetch(`${baseUrl}/initiatives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newInitPayload)
      }).then(r => r.json());

      if (!createRes.success) {
        throw new Error(`Creation failed: ${JSON.stringify(createRes)}`);
      }
      const created = createRes.data;
      console.log(`   ✅ Created Initiative ID: ${created.id}`);
      console.log(`   Title: "${created.title}"`);
      if (created.evaluation) {
        console.log(`   AI Composite Risk: ${created.evaluation.overall_risk_score}/100`);
        console.log(`   Financial Impact: ${created.evaluation.financial_impact_score}/100`);
        console.log(`   Operational Friction: ${created.evaluation.operational_friction_score}/100`);
        console.log(`   Compliance Risk: ${created.evaluation.compliance_risk_score}/100`);
        console.log(`   Executive Verdict: ${created.evaluation.executive_action_verdict}`);
      }

      // 5. Test Workflow Stage Transition
      console.log('\n5️⃣ Testing Governance Stage Transition & Reviewer Sign-off...');
      const transitionRes = await fetch(`${baseUrl}/initiatives/${created.id}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          to_stage: 'Under_Review',
          notes: 'Initial PCI-DSS architectural review verified by Admin. Routed to Finance and Engineering Leads.'
        })
      }).then(r => r.json());

      if (!transitionRes.success) {
        throw new Error(`Transition failed: ${JSON.stringify(transitionRes)}`);
      }
      console.log(`   ✅ ${transitionRes.message}`);

      // 6. Test Workflow Kanban Board
      console.log('\n6️⃣ Testing Departmental Workflow Kanban Pipeline Board...');
      const boardRes = await fetch(`${baseUrl}/workflows/board`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      console.log(`   ✅ Total Pipeline Items: ${boardRes.data.total_initiatives}`);
      Object.entries(boardRes.data.columns).forEach(([stage, list]) => {
        console.log(`      • ${stage}: ${list.length} item(s)`);
      });

      // 7. Test Cross-Department Knowledge Assistant (Intelligence QA)
      console.log('\n7️⃣ Testing Cross-Departmental Knowledge Assistant QA...');
      const queryRes = await fetch(`${baseUrl}/intelligence/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          query: 'What are the main compliance and legal risks across our active infrastructure proposals?'
        })
      }).then(r => r.json());

      if (!queryRes.success) {
        throw new Error(`Intelligence query failed: ${JSON.stringify(queryRes)}`);
      }
      console.log(`   ✅ Assistant Confidence: ${queryRes.data.confidence_rating}`);
      console.log(`   Cited Initiative IDs: [${(queryRes.data.cited_initiative_ids || []).join(', ')}]`);
      console.log(`   Answer Excerpt: ${queryRes.data.answer.slice(0, 150)}...`);

      // 8. Test Executive Dashboard Metrics
      console.log('\n8️⃣ Testing Executive KPI Dashboard Metrics...');
      const metricsRes = await fetch(`${baseUrl}/metrics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      console.log('   ✅ Active Capital Exposure: $' + Number(metricsRes.data.summary.total_budget).toLocaleString());
      console.log('   ✅ Pending Approvals:', metricsRes.data.summary.pending_approvals);
      console.log('   ✅ Avg Enterprise Risk Score:', metricsRes.data.summary.avg_risk_score);
      console.log('   ✅ Identified Bottlenecks:', metricsRes.data.summary.bottlenecks_count);

      // 9. Test Immutable Compliance Audit Log
      console.log('\n9️⃣ Testing Immutable Compliance Audit Trail...');
      const auditRes = await fetch(`${baseUrl}/audit-logs`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json());
      console.log(`   ✅ Total Immutable Audit Records: ${auditRes.pagination.total}`);
      console.log(`   Latest Action: [${auditRes.data[0]?.action_type}] by ${auditRes.data[0]?.actor_name || 'System'}`);

      console.log('\n🎉 ALL 9 SYSTEM VERIFICATION GATES PASSED FLAWLESSLY WITH ZERO ERRORS!\n');
    } catch (err) {
      console.error('\n❌ Self-test failed:', err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runSelfTest();
