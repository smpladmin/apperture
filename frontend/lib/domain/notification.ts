import { type } from 'os';
import { TrendData } from './eventData';
import { FunnelTrendsData } from './funnel';
import { MetricTrend } from './metric';

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
  notificationActive: boolean;
};
