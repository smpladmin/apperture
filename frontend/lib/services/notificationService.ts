import { ApperturePost, AppertureGet, ApperturePut } from './util';
import {
  Notifications,
  NotificationVariant,
  ThresholdMetricType,
} from '../domain/notification';

export const setAlert = async (
  dsId: string,
  name: string,
  notificationMetric: string,
  thresholdMetric: string,
  values: number[],
  variant: NotificationVariant,
  reference: string
) => {
  return await ApperturePost('/notifications', {
    datasourceId: dsId,
    name,
    notificationType: 'alert',
    metric: notificationMetric,
    multiNode: false,
    appertureManaged: false,
    pctThresholdActive:
      thresholdMetric === ThresholdMetricType.Percentage ? true : false,
    pctThresholdValues:
      thresholdMetric === ThresholdMetricType.Percentage
        ? { min: values?.[0], max: values?.[1] }
        : null,
    absoluteThresholdActive:
      thresholdMetric === ThresholdMetricType.Range ? true : false,
    absoluteThresholdValues:
      thresholdMetric === ThresholdMetricType.Range
        ? { min: values?.[0], max: values?.[1] }
        : null,
    formula: 'a',
    variableMap: { a: [name] },
    frequency: 'daily',
    preferredHourGMT: 5,
    preferredChannels: ['slack'],
    notificationActive: true,
    variant,
    reference,
  });
};

export const getSavedNotificationsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/notifications?datasource_id=${dsId}`);
  return res.data;
};

export const updateNotificationActiveState = async (
  id: string,
  notification: Notifications,
  notificationActive: boolean
) => {
  const res = await ApperturePut(`/notifications/${id}`, {
    ...notification,
    notificationActive,
    preferredHourGMT: notification.preferredHourGmt,
  });
  return res.data;
};
