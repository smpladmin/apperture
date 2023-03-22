import {
  ApperturePost,
  AppertureGet,
  ApperturePut,
  ApperturePrivateGet,
  AppertureDelete,
} from './util';
import {
  Notifications,
  NotificationType,
  NotificationVariant,
  ThresholdMetricType,
} from '../domain/notification';

export const setAlert = async (
  dsId: string,
  name: string,
  notificationType: NotificationType[],
  notificationMetric: string,
  thresholdMetric: string,
  values: number[],
  variant: NotificationVariant,
  reference: string
) => {
  return await ApperturePost('/notifications', {
    datasourceId: dsId,
    name,
    notificationType: notificationType,
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

export const updateAlert = async (
  notificationId: string,
  dsId: string,
  name: string,
  notificationType: NotificationType[],
  notificationMetric: string,
  thresholdMetric: string,
  values: number[],
  variant: NotificationVariant,
  reference: string
) => {
  return await ApperturePut(`/notifications/${notificationId}`, {
    datasourceId: dsId,
    name,
    notificationType: notificationType,
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

export const getNotificationByReference = async (
  reference: string,
  dsId: string
) => {
  const res = await AppertureGet(
    `/notifications?reference=${reference}&datasource_id=${dsId}`
  );
  return res.data;
};

export const _getNotificationByReference = async (
  token: string,
  reference: string,
  dsId: string
) => {
  const res = await ApperturePrivateGet(
    `/notifications?reference=${reference}&datasource_id=${dsId}`,
    token
  );
  return res.data;
};

export const deleteNotification = async (id: string) => {
  const res = await AppertureDelete(`/notifications/${id}`);
  return res;
};
