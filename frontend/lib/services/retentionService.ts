import { Granularity } from '@lib/domain/retention';
import { ApperturePost } from './util';
import { DateFilterObj } from '@lib/domain/common';
import { FunnelStep } from '@lib/domain/funnel';

export const getTransientTrendsData = async (
  dsId: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  interval: number
) => {
  const res = await ApperturePost('/retention/trends/transient', {
    datasourceId: dsId,
    startEvent,
    goalEvent,
    dateFilter,
    granularity,
    interval,
  });
  return res.data || [];
};
