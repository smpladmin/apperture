import { EventOrSegmentComponent } from '@lib/domain/metric';
import { ApperturePost } from './util';

type MetricRequestBody = {
  dsId: string;
  functions: string;
  aggregates: EventOrSegmentComponent[];
  breakdown: string[];
  startDate: Date | undefined;
  endDate: Date | undefined;
};

const formatDatalabel = (date: Date) => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

export const computeMetric = async (
  dsId: string,
  functions: string,
  aggregates: EventOrSegmentComponent[],
  breakdown: string[],
  startDate: Date | undefined,
  endDate: Date | undefined
) => {
  const requestBody: any = {
    datasourceId: dsId,
    function: functions,
    aggregates,
    breakdown,
  };
  if (startDate) {
    requestBody.startDate = formatDatalabel(startDate);
  }
  if (endDate) {
    requestBody.endDate = formatDatalabel(endDate);
  }
  const res = await ApperturePost('metrics/compute', requestBody);
  return res.data;
};
