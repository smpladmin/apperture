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
import { CreateRetentionAction } from './CreateRetentionAction';
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
  saveRetention,
  updateRetention,
} from '@lib/services/retentionService';
import RetentionTrend from '../components/RetentionTrend';
import IntervalTab from '../components/IntervalTab';
import { hasValidEvents } from '../utils';
import LoadingSpinner from '@components/LoadingSpinner';
import TransientRetentionView from '../components/TransientRetentionView';

const Retention = ({ savedRetention }: { savedRetention?: Retention }) => {
  const router = useRouter();
  const {
    query: { dsId, retentionId },
  } = router;

  const datasourceId = (dsId as string) || savedRetention?.datasourceId;
  const [retentionName, setRetentionName] = useState<string>(
    savedRetention?.name || 'Untitled Retention'
  );

  const [retentionEvents, setRetentionEvents] = useState<RetentionEvents>(
    savedRetention?.startEvent && savedRetention?.goalEvent
      ? {
          startEvent: savedRetention.startEvent,
          goalEvent: savedRetention.goalEvent,
        }
      : {
          startEvent: { event: '', filters: [] },
          goalEvent: { event: '', filters: [] },
        }
  );

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
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [isRetentionBeingEdited, setRetentionBeingEdited] = useState(false);

  useEffect(() => {
    if (hasValidEvents(retentionEvents)) {
      setSaveButtonDisabled(false);
    } else {
      setSaveButtonDisabled(true);
    }
  }, [retentionEvents]);

  useEffect(() => {
    if (hasValidEvents(retentionEvents)) {
      setIsEmpty(false);
    } else setIsEmpty(true);
  }, [retentionEvents]);

  useEffect(() => {
    if (!hasValidEvents(retentionEvents)) {
      return;
    }
    setInterval(0);
    setPageNumber(0);
    setTrigger((prevState: Boolean) => !prevState);
  }, [retentionEvents, granularity, dateFilter]);

  useEffect(() => {
    if (!hasValidEvents(retentionEvents)) {
      return;
    }

    const getTrendsData = async () => {
      const trendsData = await getTransientTrendsData(
        datasourceId!!,
        retentionEvents.startEvent,
        retentionEvents.goalEvent,
        dateFilter,
        granularity,
        interval
      );
      setTrendsData(trendsData);
      setIsTrendsDataLoading(false);
    };

    setIsTrendsDataLoading(true);
    getTrendsData();
  }, [interval, trigger]);

  useEffect(() => {
    if (router.pathname.includes('edit')) setRetentionBeingEdited(true);
  }, []);

  useEffect(() => {
    if (!hasValidEvents(retentionEvents)) {
      return;
    }

    const getTransientData = async () => {
      const retentionData = await getTransientRetentionData(
        datasourceId!!,
        retentionEvents.startEvent,
        retentionEvents.goalEvent,
        dateFilter,
        granularity,
        pageNumber,
        pageSize
      );
      setRetentionData(retentionData);
      setIsIntervalDataLoading(false);
    };

    setIsIntervalDataLoading(true);
    getTransientData();
  }, [pageNumber, trigger]);

  const handleSaveOrUpdateRetention = async () => {
    const { data, status } = isRetentionBeingEdited
      ? await updateRetention(
          retentionId as string,
          dsId as string,
          retentionName,
          retentionEvents.startEvent,
          retentionEvents.goalEvent,
          dateFilter,
          granularity
        )
      : await saveRetention(
          dsId as string,
          retentionName,
          retentionEvents.startEvent,
          retentionEvents.goalEvent,
          dateFilter,
          granularity
        );

    setSaveButtonDisabled(true);

    if (status === 200) {
      router.push({
        pathname: '/analytics/retention/view/[retentionId]',
        query: { retentionId: data?._id || retentionId, dsId },
      });
    } else {
      setSaveButtonDisabled(false);
    }
  };

  return (
    <Flex
      px={'5'}
      direction={'column'}
      h={'full'}
      bg={'white.400'}
      overflow={'auto'}
    >
      <Header
        handleGoBack={() => router.back()}
        name={retentionName}
        setName={setRetentionName}
        handleSave={handleSaveOrUpdateRetention}
        isSaveButtonDisabled={isSaveButtonDisabled}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        <ActionPanel>
          <Card>
            <CreateRetentionAction
              retentionEvents={retentionEvents}
              setRetentionEvents={setRetentionEvents}
              granularity={granularity}
              setGranularity={setGranularity}
            />
          </Card>
        </ActionPanel>
        <ViewPanel>
          <TransientRetentionView
            isEmpty={isEmpty}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            trendScale={trendScale}
            setTrendScale={setTrendScale}
            isIntervalDataLoading={isIntervalDataLoading}
            isTrendsDataLoading={isTrendsDataLoading}
            interval={interval}
            setInterval={setInterval}
            retentionData={retentionData}
            setPageNumber={setPageNumber}
            pageSize={pageSize}
            trendsData={trendsData}
          />
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default Retention;
