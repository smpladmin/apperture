import { EventOrSegmentComponent } from '@lib/domain/metric';
import { ApperturePost } from './util';

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: EventOrSegmentComponent[],
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
