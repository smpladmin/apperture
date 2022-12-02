import { WatchListItemType } from '@lib/domain/watchlist';

export const WatchListItemOptions = [
  {
    id: WatchListItemType.ALL,
    label: 'All',
  },
  {
    id: WatchListItemType.NOTIFICATIONS,
    label: 'Notifications',
  },
  {
    id: WatchListItemType.FUNNELS,
    label: 'Funnels',
  },
];
