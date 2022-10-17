export const notificationMetricOptions = [
  {
    name: 'users',
    label: '#Users',
    isDisabled: true,
  },
  {
    name: 'hits',
    label: '#Hits',
    isDisabled: false,
  },
];

export const thresholdMetricOptions = [
  {
    name: 'range',
    label: 'out of Range',
    isDisabled: false,
  },
  {
    name: 'percentage',
    label: 'more than %',
    isDisabled: false,
  },
];

export const getMinimumValue = (data: any, type: any) => {
  return data.reduce(
    (acc: any, val: any) => (acc < val?.[type] ? acc : val?.[type]),
    data[0].hits
  );
};

export const getMaximumValue = (data: any, type: any) => {
  return data.reduce(
    (acc: any, val: any) => (acc > val?.[type] ? acc : val?.[type]),
    data[0].hits
  );
};
