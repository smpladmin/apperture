import { Funnel } from './funnel';
import { Metric } from './metric';
import { Segment } from './segment';

export enum WatchListItemType {
  ALL = 'all',
  METRICS = 'metrics',
  FUNNELS = 'funnels',
  SEGMENTS = 'segments',
}

const paths = {
  [WatchListItemType.ALL]: '',
  [WatchListItemType.METRICS]: 'metric/view',
  [WatchListItemType.FUNNELS]: 'funnel/view',
  [WatchListItemType.SEGMENTS]: 'segment/edit',
};

export namespace WatchListItemType {
  export function toURLPath(type: WatchListItemType): string {
    return paths[type];
  }
}

export type SavedItems = {
  type: WatchListItemType;
  details: Funnel | Segment | Metric;
};
