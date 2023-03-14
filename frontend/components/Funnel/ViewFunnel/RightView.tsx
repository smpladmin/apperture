import {
  Button,
  Flex,
  Text,
  Highlight,
  Divider,
  useDisclosure,
} from '@chakra-ui/react';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import LoadingSpinner from '@components/LoadingSpinner';
import {
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
  FunnelEventConversion,
  DateFilter,
  DateFilterType,
} from '@lib/domain/funnel';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import FunnelChart from '../components/FunnelChart';
import Trend from '../components/Trend';
import UserConversionDrawer from '../components/UserCoversionDrawer';
import DateFilterComponent from '@components/Date/DateFilter';
import TransientFunnelView from '../CreateFunnel/TransientFunnelView';

const RightView = ({
  funnelSteps,
  computedFunnel,
  computedTrendsData,
  datasourceId,
  isLoading,
  dateFilter,
  dateFilterType,
}: {
  funnelSteps: FunnelStep[];
  computedFunnel: FunnelData[];
  computedTrendsData: FunnelTrendsData[];
  datasourceId: string;
  isLoading: boolean;
  dateFilter: DateFilter | null;
  dateFilterType: DateFilterType | null;
}) => {
  const router = useRouter();
  const { dsId } = router.query;
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const [dataSource, setDataSource] = useState(dsId || datasourceId);
  const [conversionData, setConversionData] =
    useState<FunnelEventConversion | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  const funnelConversion =
    computedFunnel?.[computedFunnel?.length - 1]?.['conversion'] || 0;

  const funnelLastStepUsers =
    computedFunnel?.[computedFunnel?.length - 1]?.['users'] || 0;

  const [selectedFunnelSteps, setSelectedFunnelSteps] = useState<FunnelStep[]>(
    []
  );

  const handleChartClick = async (properties: any) => {
    onDrawerOpen();
    const { data } = properties.data;
    const { step, event } = data;
    setSelectedEvent(event.trim());
    const selectedSteps = funnelSteps.slice(0, step);
    setSelectedFunnelSteps(selectedSteps);
  };

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
      <UserConversionDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        datasourceId={dataSource as string}
        event={selectedEvent as string}
        selectedFunnelSteps={selectedFunnelSteps}
        dateFilter={dateFilter}
        dateFilterType={dateFilterType}
      />
    </ViewPanel>
  );
};

export default RightView;
