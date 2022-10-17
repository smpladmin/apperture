import { AppertureAPI } from '@lib/apiClient';
import { AxiosError } from 'axios';
import { ThresholdMetricType } from '../domain/notification';

export const setAlert = async (
  dsId: string,
  nodeName: string,
  notificationMetric: string,
  thresholdMetric: string,
  values: number[]
) => {
  try {
    return await AppertureAPI.post('/notifications', {
      datasourceId: dsId,
      name: nodeName,
      notificationType: 'alert',
      metric: notificationMetric,
      multiNode: false,
      appertureManaged: false,
      pctThresholdActive:
        thresholdMetric === ThresholdMetricType.Percentage ? true : false,
      absoluteThresholdActive:
        thresholdMetric === ThresholdMetricType.Range ? true : false,
      pctThresholdValues: ThresholdMetricType.Percentage
        ? { min: values?.[0], max: values?.[1] }
        : null,
      absoluteThresholdValues: ThresholdMetricType.Range
        ? { min: values?.[0], max: values?.[1] }
        : null,
      formula: 'a',
      variableMap: { a: [nodeName] },
      frequency: 'daily',
      preferredHourGMT: 5,
      preferredChannels: ['slack'],
      notificationActive: true,
    });
  } catch (error) {
    console.log((error as AxiosError).message);
    return null;
  }
};
