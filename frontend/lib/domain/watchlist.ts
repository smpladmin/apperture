import { ComputedFunnel } from './funnel';
import { Notifications } from './notification';

export enum WatchListItemType {
  ALL = 'all',
  EVENTS = 'events',
  NOTIFICATIONS = 'notifications',
  FUNNELS = 'funnels',
}

export type SavedItems = {
  type: WatchListItemType;
  details: ComputedFunnel | Notifications;
  users: number;
  change: number;
  actions: any;
};
