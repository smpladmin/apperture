import { AppWithIntegrations } from '@lib/domain/app';
import { SavedItemsDetails, WatchListItemType } from '@lib/domain/watchlist';

export const getAppId = (apps: AppWithIntegrations[], dsId: string) => {
  return (
    apps
      .flatMap((app) =>
        app?.integrations.flatMap((integration) => integration.datasources)
      )
      .find((app) => app?._id === dsId)?.appId ||
    apps[0]?.integrations[0]?.datasources[0]?.appId
  );
};

export const addItemTypeToSavedItems = (
  type: WatchListItemType,
  items: SavedItemsDetails[]
) => {
  return items.map((item: any) => {
    return { type, details: item };
  });
};
