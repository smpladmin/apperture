import { Granularity } from '@lib/domain/retention';
import {
  AppertureDelete,
  AppertureGet,
  ApperturePost,
  ApperturePrivateGet,
} from './util';
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
  const res = await ApperturePost(
    `/retention/trends/transient?interval=${interval}`,
    {
      datasourceId: dsId,
      startEvent,
      goalEvent,
      dateFilter,
      granularity,
    }
  );
  return res.data || [];
};

export const getTransientRetentionData = async (
  dsId: string,
  startEvent: FunnelStep,
  goalEvent: FunnelStep,
  dateFilter: DateFilterObj,
  granularity: Granularity,
  page_number: number,
  page_size: number = 10
) => {
  const res = await ApperturePost(
    `/retention/transient?page_number=${page_number}&page_size=${page_size}`,
    {
      datasourceId: dsId,
      startEvent,
      goalEvent,
      dateFilter,
      granularity,
    }
  );
  return res.data || [];
};

export const getSavedRetentionsForDatasourceId = async (dsId: string) => {
  const res = await AppertureGet(`/retention?datasource_id=${dsId}`);
  return res.data;
};

export const deleteRetention = async (id: string, dsId: string) => {
  return await AppertureDelete(`/retention/${id}`);
};

export const _getSavedRetention = async (
  token: string,
  retentionId: string
) => {
  const res = await ApperturePrivateGet(`/retention/${retentionId}`, token);
  return res.data;
};
