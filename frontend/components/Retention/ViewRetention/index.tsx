import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import Header from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DateFilterComponent from '@components/Date/DateFilter';
import RetentionEmptyState from '../components/RetentionEmptyState';
import { Hash, Percent } from 'phosphor-react';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import {
  Granularity,
  RetentionEvents,
  RetentionTrendsData,
  RetentionData,
  TrendScale,
  Retention,
} from '@lib/domain/retention';
import { DateFilterObj, DateFilterType } from '@lib/domain/common';
import {
  getTransientRetentionData,
  getTransientTrendsData,
} from '@lib/services/retentionService';
import RetentionTrend from '../components/RetentionTrend';
import IntervalTab from '../components/IntervalTab';
import { hasValidEvents } from '../utils';
import LoadingSpinner from '@components/LoadingSpinner';
import ViewHeader from '@components/EventsLayout/ViewHeader';
import { CreateRetentionAction } from '../CreateRetention/CreateRetentionAction';
import LeftView from './LeftView';
import RightView from './RightView';

const ViewRetention = ({ savedRetention }: { savedRetention: Retention }) => {
  const router = useRouter();
  const {
    query: { retentionId, dsId },
  } = router;

  const datasourceId = (dsId as string) || savedRetention?.datasourceId;

  const [dateFilter, setDateFilter] = useState<DateFilterObj>({
    filter: savedRetention?.dateFilter?.filter || { days: 90 },
    type: savedRetention?.dateFilter?.type || DateFilterType.LAST,
  });

  const [granularity, setGranularity] = useState<Granularity>(
    savedRetention?.granularity || Granularity.DAYS
  );

  const [trendScale, setTrendScale] = useState<TrendScale>(
    TrendScale.PERCENTAGE
  );
  const [isTrendsDataLoading, setIsTrendsDataLoading] = useState(true);
  const [isIntervalDataLoading, setIsIntervalDataLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<RetentionTrendsData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData>({
    count: 0,
    data: [],
  });
  const [pageNumber, setPageNumber] = useState(0);
  const [interval, setInterval] = useState(0);
  const [isEmpty, setIsEmpty] = useState(savedRetention ? false : true);
  const [trigger, setTrigger] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    const getTrendsData = async () => {
      const trendsData = await getTransientTrendsData(
        datasourceId!!,
        savedRetention.startEvent,
        savedRetention.goalEvent,
        savedRetention.dateFilter,
        savedRetention.granularity,
        interval
      );
      setTrendsData(trendsData);
      setIsTrendsDataLoading(false);
    };

    setIsTrendsDataLoading(true);
    getTrendsData();
  }, [interval]);

  useEffect(() => {
    const getTransientData = async () => {
      const retentionData = await getTransientRetentionData(
        datasourceId!!,
        savedRetention.startEvent,
        savedRetention.goalEvent,
        savedRetention.dateFilter,
        savedRetention.granularity,
        pageNumber,
        pageSize
      );
      setRetentionData(retentionData);
      setIsIntervalDataLoading(false);
    };

    setIsIntervalDataLoading(true);
    getTransientData();
  }, [pageNumber]);

  const handleEditRetention = () => {
    router.push({
      pathname: '/analytics/funnel/edit/[funnelId]',
      query: { retentionId, dsId: datasourceId },
    });
  };

  const handleGoBack = () => {
    router.push({
      pathname: '/analytics/retention/list/[dsId]',
      query: { dsId: datasourceId },
    });
  };

  return (
    <Flex
      px={'5'}
      direction={'column'}
      h={'full'}
      bg={'white.400'}
      overflow={'auto'}
    >
      <ViewHeader
        name={savedRetention.name}
        handleGoBack={handleGoBack}
        handleEditClick={handleEditRetention}
        handleNotificationClick={() => {}}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        {/* <LeftView
          steps={savedFunnel.steps}
          conversionWindow={conversionWindow}
          randomSequence={randomSequence}
        />
        <RightView
          funnelSteps={savedFunnel.steps}
          computedFunnel={computedFunnelData}
          computedTrendsData={computedTrendsData}
          isLoading={isLoading}
          dateFilter={dateFilter}
          conversionWindow={conversionWindow}
        /> */}
      </Flex>
    </Flex>
  );
};

export default ViewRetention;
