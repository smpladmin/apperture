import { ComputedFunnel } from './funnel';
import { Metric } from './metric';
import { Segment } from './segment';

export enum WatchListItemType {
  ALL = 'all',
  METRICS = 'metrics',
  FUNNELS = 'funnels',
  SEGMENTS = 'segments',
}

export type SavedItems = {
  type: WatchListItemType;
  details: ComputedFunnel | Segment;
};
