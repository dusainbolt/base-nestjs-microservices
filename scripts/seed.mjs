import { spawnSync } from 'node:child_process';
import process from 'node:process';

const seeds = {
  content: 'apps/content-service/src/prisma/seed-levels.ts',
};

const serviceKey = process.argv[2];

if (!serviceKey || !seeds[serviceKey]) {
  console.error('❌ Service name không hỗ trợ seeding.');
  console.log('Các service hỗ trợ:', Object.keys(seeds).join(', '));
  process.exit(1);
}

const seedPath = seeds[serviceKey];
console.log(`🌱 Seeding data for ${serviceKey}...`);

const result = spawnSync('npx', ['ts-node', seedPath], {
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  console.error(`❌ Seeding failed with status ${result.status}`);
  process.exit(1);
}

console.log('✅ Seeding completed!');
