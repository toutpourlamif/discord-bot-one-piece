import { pgEnum } from 'drizzle-orm/pg-core';

import { ZONES } from './zones.js';

export const zoneEnum = pgEnum('zone', ZONES);
