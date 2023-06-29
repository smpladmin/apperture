import { RetentionWithUser } from '@lib/domain/retention';
import {
  NotificationType,
  NotificationWithUser,
} from '@lib/domain/notification';
import { ActionWithUser } from './action';
import { FunnelWithUser } from './funnel';
import { MetricWithUser } from './metric';
import { SegmentWithUser } from './segment';
import { WorkbookWithUser } from './workbook';
import { DataMartWithUser } from './datamart';

export enum WatchListItemType {
  ALL = 'all',
  METRICS = 'metrics',
  FUNNELS = 'funnels',
  SEGMENTS = 'segments',
  ACTIONS = 'actions',
  RETENTIONS = 'retentions',
  WORKBOOKS = 'workbooks',
  DATAMARTS = 'datamarts',
}

const paths = {
  [WatchListItemType.ALL]: '',
  [WatchListItemType.METRICS]: 'metric/view',
  [WatchListItemType.FUNNELS]: 'funnel/view',
  [WatchListItemType.SEGMENTS]: 'segment/edit',
  [WatchListItemType.ACTIONS]: 'action/edit',
  [WatchListItemType.RETENTIONS]: 'retention/edit',
  [WatchListItemType.WORKBOOKS]: 'workbook/create',
  [WatchListItemType.DATAMARTS]: 'datamart/edit',
};

export namespace WatchListItemType {
  export function toURLPath(type: WatchListItemType): string {
    return paths[type];
  }
}

export type SavedItemsDetails =
  | FunnelWithUser
  | SegmentWithUser
  | MetricWithUser
  | NotificationWithUser
  | ActionWithUser
  | WorkbookWithUser
  | RetentionWithUser
  | DataMartWithUser;

export type SavedItems = {
  type: WatchListItemType | NotificationType[];
  details: SavedItemsDetails;
};
