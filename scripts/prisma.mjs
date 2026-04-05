import { spawnSync } from 'node:child_process';
import process from 'node:process';

const configs = {
  auth: 'apps/auth-service/prisma.config.ts',
  user: 'apps/user-service/prisma.config.ts',
  product: 'apps/product-service/prisma.config.ts',
  media: 'apps/media-service/prisma.config.ts',
  content: 'apps/content-service/prisma.config.ts',
};

const operation = process.argv[2]; // generate, migrate, studio, deploy
const serviceKey = process.argv[3]; // auth, user, product...
const extraArgs = process.argv.slice(4); // --name init...

if (!operation) {
  console.error(
    '❌ Vui lòng cung cấp phép toán prisma (generate, migrate, studio, deploy).',
  );
  process.exit(1);
}

// Chạy generate cho tất cả các service nếu không chỉ định service cụ thể
if (operation === 'generate' && !serviceKey) {
  console.log('🔹 Generating for all main services...');
  Object.keys(configs).forEach((key) => {
    runPrisma('generate', key);
  });
  process.exit(0);
}

if (!serviceKey || !configs[serviceKey]) {
  console.error(
    '❌ Service không hợp lệ. Các service hỗ trợ prisma:',
    Object.keys(configs).join(', '),
  );
  process.exit(1);
}

function runPrisma(op, key, extra = []) {
  const configPath = configs[key];
  console.log(`🔹 Running prisma ${op} for ${key}...`);

  let prismaArgs = [];

  switch (op) {
    case 'generate':
      prismaArgs = ['generate', `--config=${configPath}`];
      break;
    case 'migrate':
      prismaArgs = ['migrate', 'dev', `--config=${configPath}`, ...extra];
      break;
    case 'studio':
      prismaArgs = ['studio', `--config=${configPath}`];
      break;
    case 'deploy':
      prismaArgs = ['migrate', 'deploy', `--config=${configPath}`];
      break;
    default:
      console.error(`Unknown operation ${op}`);
      process.exit(1);
  }

  const result = spawnSync('npx', ['prisma', ...prismaArgs], {
    stdio: 'inherit',
    shell: true,
  });

  if (result.status !== 0) {
    console.error(`❌ Prisma operation failed with status ${result.status}`);
    return false;
  }
  return true;
}

runPrisma(operation, serviceKey, extraArgs);
