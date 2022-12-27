import { ApperturePost } from './util';

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: any[],
  breakdown: string[]
) => {
  const res = await ApperturePost('metrics/compute', {
    datasourceId: dsId,
    function: functions,
    aggregates,
    breakdown,
  });
  return res.data;
};
