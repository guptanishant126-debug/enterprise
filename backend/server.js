import app from './src/app.js';
import db from './src/config/db.js';
import { testSupabaseConnection } from './src/config/supabase.js';
import { seedDatabaseIfEmpty } from './db/seed.js';
import dotenv from 'dotenv';

dotenv.config();

// Verify mandatory environment variables
const requiredEnv = ['JWT_SECRET', 'GEMINI_API_KEY'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`FATAL: Missing mandatory environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log('🚀 [NexusAI] Initializing Enterprise Backend runtime...');

    // Initialize database connection and schemas
    await db.initializeDatabase();

    // Verify Supabase connectivity & keys if provided
    await testSupabaseConnection();

    // Auto-seed enterprise defaults if fresh database
    await seedDatabaseIfEmpty();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 NexusAI Enterprise Server active on http://localhost:${PORT}`);
      console.log(`🔒 Security: Helmet active, CORS strict whitelist enabled`);
      console.log(`🤖 AI Engine: Gemini 2.5 Flash initialized`);
      console.log(`⚡ Supabase: Integration enabled & verified`);
      console.log(`☁️ Cloud: Ready for Render backend & Vercel client`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('FATAL: Backend bootstrap encountered an unrecoverable failure:', err);
    process.exit(1);
  }
}

bootstrap();

