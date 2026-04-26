import type { DomainName } from '../../shared/domains.js';
import { characterInfoProvider } from '../character/info-provider.js';
import { devilFruitInfoProvider } from '../devil_fruit/info-provider.js';
import { resourceInfoProvider } from '../resource/info-provider.js';

import type { InfoProvider } from './types.js';

export const infoProviders: Array<InfoProvider> = [devilFruitInfoProvider, resourceInfoProvider, characterInfoProvider];

export const infoProviderByDomain = new Map<DomainName, InfoProvider>(infoProviders.map((provider) => [provider.domain, provider]));
