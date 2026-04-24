import { db, resourceTemplate, type ResourceTemplate } from '@one-piece/db';
import { eq } from 'drizzle-orm';

export async function findById(id: number): Promise<ResourceTemplate | undefined> {
  const [row] = await db.select().from(resourceTemplate).where(eq(resourceTemplate.id, id)).limit(1);
  return row;
}
