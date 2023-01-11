import { ComputedFunnel } from './funnel';
import { Notifications } from './notification';

export enum WatchListItemType {
  ALL = 'all',
  METRICS = 'metrics',
  FUNNELS = 'funnels',
  SEGMENTS = 'segments',
}

export type SavedItems = {
  type: WatchListItemType;
  details: ComputedFunnel | Notifications;
  users: number;
  change: number;
  actions: any;
};
