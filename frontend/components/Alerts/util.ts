import { TrendData } from '@lib/domain/eventData';
import {
  NotificationMetricType,
  NotificationVariant,
  ThresholdMetricType,
} from '@lib/domain/notification';

export const notificationMetricOptions: {
  name: NotificationMetricType;
  label: string;
}[] = [
  {
    name: NotificationMetricType.Users,
    label: '#Users',
  },
  {
    name: NotificationMetricType.Hits,
    label: '#Hits',
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

export const getMinimumValue = (data: any[], type: NotificationMetricType) =>
  data.reduce(
    (acc: number, val: TrendData) => (acc < val?.[type] ? acc : val?.[type]),
    data[0]?.hits
  );

export const getMaximumValue = (data: any[], type: NotificationMetricType) =>
  data.reduce(
    (acc: number, val: TrendData) => (acc > val?.[type] ? acc : val?.[type]),
    data[0]?.hits
  );

export type NotificationUtilObject = {
  getMin: Function;
  getMax: Function;
  service: Function;
};

export const NotificationFactory = (variant: NotificationVariant) => {
  switch (variant) {
    case NotificationVariant.NODE:
      return {
        getMin: getMinimumValue,
        getMax: getMaximumValue,
        xField: 'startDate',
        yField: 'hits',
        metric: notificationMetricOptions[1],
      };
    case NotificationVariant.FUNNEL:
      return {
        getMin: (data: any[]) =>
          data.reduce(
            (result, value) =>
              result < value.conversion ? result : value.conversion,
            data[0].conversion
          ),
        getMax: (data: any[]) =>
          data.reduce(
            (result, value) =>
              result > value.conversion ? result : value.conversion,
            data[0].conversion
          ),
        xField: 'startDate',
        yField: 'conversion',
        metric: notificationMetricOptions[0],
      };
    default:
      return {
        getMin: () => -1,
        getMax: () => -1,
        xField: 'startDate',
        yField: 'hits',
        metric: notificationMetricOptions[0],
      };
  }
};
