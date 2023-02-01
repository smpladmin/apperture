import { Node } from '@lib/domain/node';
import { TrendData } from './eventData';
import { FunnelTrendsData } from './funnel';
import { MetricTrend } from './metric';
import { AppertureUser } from './user';

export enum ThresholdMetricType {
  Range = 'range',
  Percentage = 'percentage',
}

export enum NotificationMetricType {
  Users = 'users',
  Hits = 'hits',
}

export enum NotificationType {
  ALERT = 'alert',
  UPDATE = 'update',
}

export enum NotificationChannel {
  SLACK = 'slack',
  EMAIL = 'email',
}

export enum NotificationVariant {
  NODE = 'node',
  FUNNEL = 'funnel',
  METRIC = 'metric',
  SEGMENT = 'segment',
}

const paths = {
  [NotificationVariant.NODE]: 'explore',
  [NotificationVariant.FUNNEL]: 'funnel/view',
  [NotificationVariant.SEGMENT]: 'segment/edit',
  [NotificationVariant.METRIC]: 'metric/view',
};

export namespace NotificationVariant {
  export function toURLPath(type: NotificationVariant): string {
    return paths[type];
  }
}

export type NotificationEventsData =
  | TrendData[]
  | FunnelTrendsData[]
  | MetricTrend[];

export type Notifications = {
  _id: string;
  datasourceId: string;
  userId: string;
  appId: string;
  name: string;
  notificationType: NotificationType;
  metric: NotificationMetricType;
  multiNode: boolean;
  appertureManaged: boolean;
  pcTThresholdActive: boolean;
  pctThresholdValues?: { min: number; max: number };
  absoluteThresholdActive: boolean;
  absoluteThresholdValues?: { min: number; max: number };
  formula: string;
  variableMap: { a: string[] };
  preferredChannels: NotificationChannel[];
  preferredHourGmt: number;
  notificationActive: boolean;
  variant: NotificationVariant;
  reference: string;
  createdAt: Date;
};

export type NotificationWithUser = Notifications & {
  user: AppertureUser;
};
