import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import Header from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import DateFilterComponent from '@components/Date/DateFilter';
import RetentionEmptyState from './components/RetentionEmptyState';
import { Hash, Percent } from 'phosphor-react';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import { CreateRetentionAction } from './CreateRetentionAction';
import {
  Granularity,
  RetentionEvents,
  RetentionTrendsData,
  RetentionData,
  TrendScale,
} from '@lib/domain/retention';
import { DateFilterObj, DateFilterType } from '@lib/domain/common';
import {
  getTransientRetentionData,
  getTransientTrendsData,
} from '@lib/services/retentionService';
import RetentionTrend from './components/RetentionTrend';
import IntervalTab from './components/IntervalTab';
import { hasValidEvents } from './utils';
import LoadingSpinner from '@components/LoadingSpinner';

const Retention = () => {
  const router = useRouter();
  const {
    query: { dsId, retentionId },
  } = router;

  const datasourceId = dsId as string;
  const [retentionName, setRetentionName] =
    useState<string>('Untitled Retention');

  const [retentionEvents, setRetentionEvents] = useState<RetentionEvents>({
    startEvent: { event: '', filters: [] },
    goalEvent: { event: '', filters: [] },
  });

  const [dateFilter, setDateFilter] = useState<DateFilterObj>({
    filter: { days: 90 },
    type: DateFilterType.LAST,
  });

  const [granularity, setGranularity] = useState<Granularity>(Granularity.DAYS);

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
  const [isEmpty, setIsEmpty] = useState(true);
  const [defaultState, setDefaultState] = useState(false);
  const pageSize = 10;

  useEffect(() => {
    if (hasValidEvents(retentionEvents)) {
      setIsEmpty(false);
    } else setIsEmpty(true);
  }, [retentionEvents]);

  useEffect(() => {
    setDefaultState(true);
    setInterval(0);
    setPageNumber(0);
  }, [retentionEvents, granularity, dateFilter]);

  useEffect(() => {
    if (!hasValidEvents(retentionEvents) || defaultState) {
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
  }, [interval, retentionEvents, dateFilter]);

  useEffect(() => {
    if (!hasValidEvents(retentionEvents) || defaultState) {
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
  }, [retentionEvents, dateFilter, pageNumber]);

  useEffect(() => {
    if (defaultState) {
      setIsTrendsDataLoading(true);
      setIsIntervalDataLoading(true);
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

      getTrendsData();
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

      getTransientData();
      setDefaultState(false);
    }
  }, [defaultState]);

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
        handleSave={() => {}}
        isSaveButtonDisabled={true}
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
          <Flex direction={'column'} gap={'5'}>
            <Flex justifyContent={'space-between'}>
              <DateFilterComponent
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                isDisabled={false}
              />
              <ButtonGroup
                size="sm"
                isAttached
                variant="outline"
                isDisabled={false}
                borderRadius={'8'}
              >
                <Button
                  borderWidth={'1px'}
                  borderStyle={'solid'}
                  borderColor={'grey.400'}
                  id="yesterday"
                  background={'white.DEFAULT'}
                  color={'black.DEFAULT'}
                  fontWeight={500}
                  _hover={{
                    background: 'white.500',
                  }}
                  height={8}
                  fontSize={'xs-12'}
                  onClick={() => {
                    setTrendScale(TrendScale.ABSOLUTE);
                  }}
                >
                  <Hash
                    size={16}
                    color={
                      trendScale == TrendScale.ABSOLUTE
                        ? BLACK_DEFAULT
                        : GREY_500
                    }
                  />
                </Button>
                <Button
                  borderWidth={'1px'}
                  borderStyle={'solid'}
                  borderColor={'grey.400'}
                  id="yesterday"
                  background={'white.DEFAULT'}
                  color={'black.DEFAULT'}
                  fontWeight={500}
                  _hover={{
                    background: 'white.500',
                  }}
                  height={8}
                  fontSize={'xs-12'}
                  onClick={() => {
                    setTrendScale(TrendScale.PERCENTAGE);
                  }}
                >
                  <Percent
                    size={16}
                    color={
                      trendScale == TrendScale.PERCENTAGE
                        ? BLACK_DEFAULT
                        : GREY_500
                    }
                  />
                </Button>
              </ButtonGroup>
            </Flex>
            {isEmpty ? (
              <Card minHeight={'120'} borderRadius={'16'}>
                <RetentionEmptyState />
              </Card>
            ) : (
              <Card p={'0'} borderRadius={'12'} overflow={'hidden'}>
                <Flex w={'full'} direction={'column'}>
                  {isIntervalDataLoading ? (
                    <Flex
                      h={'16'}
                      w={'full'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      borderBottom={'1px'}
                      borderColor={'grey.400'}
                    >
                      <LoadingSpinner />
                    </Flex>
                  ) : (
                    <IntervalTab
                      interval={interval}
                      setInterval={setInterval}
                      retentionData={retentionData}
                      setPageNumber={setPageNumber}
                      pageSize={pageSize}
                    />
                  )}
                  {isTrendsDataLoading ? (
                    <Flex
                      h={'110'}
                      w={'full'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      <LoadingSpinner />
                    </Flex>
                  ) : (
                    <RetentionTrend data={trendsData} trendScale={trendScale} />
                  )}
                </Flex>
              </Card>
            )}
          </Flex>
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default Retention;
