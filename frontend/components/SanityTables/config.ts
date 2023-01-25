import { SanityDataSource } from '@lib/domain/eventData';

export const sanityDatasources = [
  { id: SanityDataSource.ALL, label: 'ALL' },
  { id: SanityDataSource.MIXPANEL, label: 'Mixpanel' },
  { id: SanityDataSource.BACKEND, label: 'Backend CRM' },
  { id: SanityDataSource.USERS, label: 'Users (Google Sheet)' },
];
