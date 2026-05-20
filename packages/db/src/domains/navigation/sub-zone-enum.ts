import { pgEnum } from 'drizzle-orm/pg-core';

import { SUB_ZONES } from './world/islands/registry.js';

export const subZoneEnum = pgEnum('sub_zone', SUB_ZONES);
