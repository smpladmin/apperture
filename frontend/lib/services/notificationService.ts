import { ApperturePost, AppertureGet } from './util';
import { ThresholdMetricType } from '../domain/notification';

export const setAlert = async (
  dsId: string,
  nodeName: string,
  notificationMetric: string,
  thresholdMetric: string,
  values: number[]
) => {
  return await ApperturePost('/notifications', {
    datasourceId: dsId,
    name: nodeName,
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
    variableMap: { a: [nodeName] },
    frequency: 'daily',
    preferredHourGMT: 5,
    preferredChannels: ['slack'],
    notificationActive: true,
  });
};

export const getSavedNotificationsForUser = async () => {
  const res = await AppertureGet(`/notifications`);
  return res.data;
};
