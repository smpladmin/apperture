import { TrendData } from '@lib/domain/eventData';
import {
  NotificationMetricType,
  ThresholdMetricType,
} from '@lib/domain/notification';

export const notificationMetricOptions = [
  {
    name: NotificationMetricType.Users,
    label: '#Users',
    isDisabled: true,
  },
  {
    name: NotificationMetricType.Hits,
    label: '#Hits',
    isDisabled: false,
  },
];

export const thresholdMetricOptions = [
  {
    name: ThresholdMetricType.Range,
    label: 'out of Range',
    isDisabled: false,
  },
  {
    name: ThresholdMetricType.Percentage,
    label: 'more than %',
    isDisabled: false,
  },
];

export const getMinimumValue = (
  data: TrendData[],
  type: NotificationMetricType
) => {
  return data.reduce(
    (acc: number, val: TrendData) => (acc < val?.[type] ? acc : val?.[type]),
    data[0].hits
  );
};

export const getMaximumValue = (
  data: TrendData[],
  type: NotificationMetricType
) => {
  return data.reduce(
    (acc: number, val: TrendData) => (acc > val?.[type] ? acc : val?.[type]),
    data[0]?.hits
  );
};
