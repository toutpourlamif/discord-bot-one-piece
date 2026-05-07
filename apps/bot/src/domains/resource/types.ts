import type { ResourceName } from '@one-piece/db';

export type ResourceAmount = {
  name: ResourceName;
  quantity: number;
};

export type Inventory = Array<ResourceAmount>;
