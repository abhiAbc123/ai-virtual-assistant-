// scripts/db-setup.js
// Creates the SQLite database and User table directly using Prisma's built-in engine
// Run with: node scripts/db-setup.js

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set env so prisma client can find the db
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

try {
  console.log('Applying schema to database via prisma db push...');
  execSync('npx prisma db push --url file:./prisma/dev.db', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env },
  });
  console.log('✅ Database ready!');
} catch (err) {
  console.error('Failed to push schema:', err.message);
  process.exit(1);
}
