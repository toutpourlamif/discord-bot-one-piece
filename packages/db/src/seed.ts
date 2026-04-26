import { closeDb, db } from './client.js';
import { seedCharacter } from './domains/character/character_template/seed.js';
import { seedDevilFruits } from './domains/devil_fruit/index.js';
import { seedResources } from './domains/resource/index.js';

try {
  await seedDevilFruits(db);
  await seedResources(db);
  await seedCharacter(db);
  console.log('Seed terminé');
} catch (err) {
  console.error('Seed failed:', err);
  process.exit(1);
} finally {
  await closeDb();
}
