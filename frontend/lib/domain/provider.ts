import { capitalizeFirstLetter } from '@lib/utils/common';

export enum Provider {
  GOOGLE = 'google',
  MIXPANEL = 'mixpanel',
  AMPLITUDE = 'amplitude',
  CLEVERTAP = 'clevertap',
  APPERTURE = 'apperture',
  API = 'api',
  MYSQL = 'mysql',
  MSSQL = 'mssql',
  CSV = 'csv',
  SAMPLE = 'sample',
  BRANCH = 'branch',
  TATA_IVR = 'tata_ivr',
  EVENT_LOGS = 'event_logs',
}
export namespace Provider {
  export function getDisplayName(provider: Provider): string {
    if (provider == Provider.GOOGLE) return 'GA';
    else return capitalizeFirstLetter(provider);
  }
}
