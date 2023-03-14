import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateFilter, DateFilterType } from '@lib/domain/common';
import { FunnelData, FunnelStep, FunnelTrendsData } from '@lib/domain/funnel';
import React from 'react';
import TransientFunnelView from '../CreateFunnel/TransientFunnelView';

const RightView = ({
  funnelSteps,
  computedFunnel,
  computedTrendsData,
  isLoading,
  dateFilter,
  dateFilterType,
}: {
  funnelSteps: FunnelStep[];
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
  isLoading: boolean;
  dateFilter: DateFilter | null;
  dateFilterType: DateFilterType | null;
}) => {
  return (
    <ViewPanel>
      <TransientFunnelView
        isLoading={isLoading}
        funnelData={computedFunnel}
        trendsData={computedTrendsData}
        funnelSteps={funnelSteps}
        dateFilter={dateFilter}
        setDateFilter={() => {}}
        dateFilterType={dateFilterType}
        setDateFilterType={() => {}}
        isDateFilterDisabled={true}
      />
    </ViewPanel>
  );
};

export default RightView;
