import { capitalizeFirstLetter } from '@lib/utils/common';

export enum Provider {
  GOOGLE = 'google',
  MIXPANEL = 'mixpanel',
  AMPLITUDE = 'amplitude',
  CLEVERTAP = 'clevertap',
  APPERTURE = 'apperture',
  API = 'api',
  MYSQL = 'mysql',
}
export namespace Provider {
  export function getDisplayName(provider: Provider): string {
    if (provider == Provider.GOOGLE) return 'GA';
    else return capitalizeFirstLetter(provider);
  }
}
