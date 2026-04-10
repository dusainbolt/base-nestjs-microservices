import { spawn } from 'node:child_process';
import process from 'node:process';

const services = {
  gateway: 'api-gateway',
  auth: 'auth-service',
  user: 'user-service',
  email: 'email-service',
  log: 'log-service',
  product: 'product-service',
  media: 'media-service',
  content: 'content-service',
  ai: 'ai-service',
};

const serviceKey = process.argv[2];

if (!serviceKey || !services[serviceKey]) {
  console.error('❌ Vui lòng cung cấp service name hợp lệ.');
  console.log('Các service hỗ trợ:', Object.keys(services).join(', '));
  console.log('VD: node scripts/services.mjs auth');
  process.exit(1);
}

const serviceName = services[serviceKey];
console.log(`🚀 Starting ${serviceName} in watch mode...`);

const child = spawn('npx', ['nest', 'start', serviceName, '--watch'], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
