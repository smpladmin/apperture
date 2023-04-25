import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateFilterObj } from '@lib/domain/common';
import {
  ConversionWindowObj,
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import React from 'react';
// import TransientFunnelView from '../components/TransientFunnelView';

const RightView = ({
  funnelSteps,
  computedFunnel,
  computedTrendsData,
  isLoading,
  dateFilter,
  conversionWindow,
}: {
  funnelSteps: FunnelStep[];
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
  isLoading: boolean;
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
}) => {
  return (
    <ViewPanel>
      {/* <TransientFunnelView
        isLoading={isLoading}
        funnelData={computedFunnel}
        trendsData={computedTrendsData}
        funnelSteps={funnelSteps}
        dateFilter={dateFilter}
        setDateFilter={() => {}}
        isDateFilterDisabled={true}
        conversionWindow={conversionWindow}
      /> */}
    </ViewPanel>
  );
};

export default RightView;
