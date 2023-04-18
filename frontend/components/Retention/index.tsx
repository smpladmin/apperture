import { Box, Button, ButtonGroup, Flex } from '@chakra-ui/react';
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
  TrendScale,
} from '@lib/domain/retention';
import { DateFilterObj, DateFilterType } from '@lib/domain/common';
import { getTransientTrendsData } from '@lib/services/retentionService';
import RetentionTrend from './components/RetentionTrend';
import IntervalTab from './components/IntervalTab';

const Retention = () => {
  const router = useRouter();
  const {
    query: { dsId, funnelId },
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

  const [isLoading, setIsLoading] = useState(true);

  const [trendsData, setTrendsData] = useState<RetentionTrendsData[]>([]);

  const [interval, setInterval] = useState(0);

  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (
      !(retentionEvents.startEvent.event && retentionEvents.goalEvent.event)
    ) {
      return;
    }
    setIsEmpty(false);
    const transientTrendsData = async () => {
      const trendsData = await getTransientTrendsData(
        datasourceId!!,
        retentionEvents.startEvent,
        retentionEvents.goalEvent,
        dateFilter,
        granularity,
        interval
      );
      setTrendsData(trendsData);
      setIsLoading(false);
    };
    setIsLoading(true);
    transientTrendsData();
  }, [interval, retentionEvents, granularity, dateFilter]);

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
        setName={() => {}}
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
                  <IntervalTab
                    interval={interval}
                    setInterval={setInterval}
                    dateFilter={dateFilter}
                    granularity={granularity}
                  />
                  <RetentionTrend data={trendsData} trendScale={trendScale} />
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
