import { pgEnum } from 'drizzle-orm/pg-core';

import { ZONES } from './world/zones.js';

export const zoneEnum = pgEnum('zone', ZONES);
