import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

const connectionString = process.env.CONTENT_DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dataPath = path.join(__dirname, 'data/level/level.json');
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ Data file not found at: ${dataPath}`);
    return;
  }

  const fileContent = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(fileContent);

  console.log('--- 🌱 Starting seeding levels from level.json ---');

  for (const item of data.levels) {
    // Upsert dựa trên id (bây giờ là @id)
    const level = await prisma.level.upsert({
      where: { id: item.level },
      update: {
        description: item.description,
        passThresholdScore: item.passThresholdScore || 60,
        outputRequirements: item.outputRequirements,
        examples: item.examples || [],
      },
      create: {
        id: item.level,
        description: item.description,
        passThresholdScore: item.passThresholdScore || 60,
        outputRequirements: item.outputRequirements,
        examples: item.examples || [],
      },
    });
    console.log(`✅ Upserted Level ${level.id}`);
  }

  console.log('--- ✨ Seeding completed successfully (LevelNumber as ID)! ---');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding levels:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
