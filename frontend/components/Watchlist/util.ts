import { WatchListItemType } from '@lib/domain/watchlist';

export const WatchListItemOptions = [
  {
    id: WatchListItemType.ALL,
    label: 'All',
  },
  {
    id: WatchListItemType.METRICS,
    label: 'Metrics',
  },
  {
    id: WatchListItemType.FUNNELS,
    label: 'Funnels',
  },
  {
    id: WatchListItemType.SEGMENTS,
    label: 'Segments',
  },
];
