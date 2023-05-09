import ViewPanel from '@components/EventsLayout/ViewPanel';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import {
  Granularity,
  RetentionData,
  TrendScale,
  Retention,
} from '@lib/domain/retention';
import {
  DateFilterObj,
  DateFilterType,
  ExternalSegmentFilter,
} from '@lib/domain/common';
import { getTransientRetentionData } from '@lib/services/retentionService';
import ViewHeader from '@components/EventsLayout/ViewHeader';
import LeftView from './LeftView';
import { FunnelStep } from '@lib/domain/funnel';
import TransientRetentionView from '@components/Retention/components/TransientRetentionView';
import { Flex } from '@chakra-ui/react';
import { substituteEmptyStringWithPlaceholder } from '@components/Retention/utils';
import { replaceEmptyStringWithPlaceholderInExternalSegmentFilter } from '@lib/utils/common';

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

  const [retentionEvents] = useState<FunnelStep[]>([
    substituteEmptyStringWithPlaceholder(savedRetention?.startEvent),
    substituteEmptyStringWithPlaceholder(savedRetention?.goalEvent),
  ]);

  const [granularity] = useState<Granularity>(
    savedRetention?.granularity || Granularity.DAYS
  );

  const [trendScale, setTrendScale] = useState<TrendScale>(
    TrendScale.PERCENTAGE
  );
  const [pageNumber, setPageNumber] = useState(0);
  const [interval, setInterval] = useState(0);
  const [isTrendsDataLoading, setIsTrendsDataLoading] = useState(true);
  const [isIntervalDataLoading, setIsIntervalDataLoading] = useState(true);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [isEmpty, setIsEmpty] = useState(savedRetention ? false : true);
  const [segmentFilters] = useState<ExternalSegmentFilter[] | null>(
    savedRetention?.segmentFilter
      ? replaceEmptyStringWithPlaceholderInExternalSegmentFilter(
          savedRetention.segmentFilter
        )
      : null
  );

  useEffect(() => {
    const getTransientData = async () => {
      const retentionData = await getTransientRetentionData(
        datasourceId!!,
        savedRetention.startEvent,
        savedRetention.goalEvent,
        savedRetention.dateFilter,
        savedRetention.granularity,
        segmentFilters
      );
      setRetentionData(retentionData);
      setIsIntervalDataLoading(false);
      setIsTrendsDataLoading(false);
    };

    setIsIntervalDataLoading(true);
    setIsTrendsDataLoading(true);
    getTransientData();
  }, []);

  const handleEditRetention = () => {
    router.push({
      pathname: '/analytics/retention/edit/[retentionId]',
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
        <LeftView
          retentionEvents={retentionEvents}
          granularity={granularity}
          segmentFilters={segmentFilters}
        />
        <ViewPanel>
          <TransientRetentionView
            isEmpty={isEmpty}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            isDateFilterDisabled={true}
            trendScale={trendScale}
            setTrendScale={setTrendScale}
            isIntervalDataLoading={isIntervalDataLoading}
            isTrendsDataLoading={isTrendsDataLoading}
            retentionData={retentionData}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            interval={interval}
            setInterval={setInterval}
          />
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default ViewRetention;
