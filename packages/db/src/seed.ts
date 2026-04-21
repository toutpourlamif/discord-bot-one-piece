import { closeDb, db } from './client.js';
import { seedDevilFruits } from './domains/devil_fruit/index.js';

try {
  await seedDevilFruits(db);
  console.log('Seed terminé');
} catch (err) {
  console.error('Seed failed:', err);
  process.exit(1);
} finally {
  await closeDb();
}
