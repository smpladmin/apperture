import ViewPanel from '@components/EventsLayout/ViewPanel';
import { DateFilterObj } from '@lib/domain/common';
import {
  ConversionWindowObj,
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import React from 'react';
import TransientFunnelView from '../components/TransientFunnelView';

const RightView = ({
  funnelSteps,
  computedFunnel,
  computedTrendsData,
  isLoading,
  dateFilter,
  conversionWindow,
  randomSequence,
}: {
  funnelSteps: FunnelStep[];
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
  isLoading: boolean;
  dateFilter: DateFilterObj;
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
}) => {
  return (
    <ViewPanel>
      <TransientFunnelView
        isLoading={isLoading}
        isEmpty={false}
        funnelData={computedFunnel}
        trendsData={computedTrendsData}
        funnelSteps={funnelSteps}
        dateFilter={dateFilter}
        setDateFilter={() => {}}
        isDateFilterDisabled={true}
        conversionWindow={conversionWindow}
        randomSequence={randomSequence}
      />
    </ViewPanel>
  );
};

export default RightView;
