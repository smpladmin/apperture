import { Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import Header from '@components/EventsLayout/ActionHeader';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { CreateRetentionAction } from './CreateRetentionAction';
import {
  Granularity,
  RetentionEvents,
  RetentionTrendsData,
  RetentionData,
  TrendScale,
  Retention,
} from '@lib/domain/retention';
import {
  DateFilterObj,
  DateFilterType,
  ExternalSegmentFilter,
  GroupConditions,
} from '@lib/domain/common';
import {
  getTransientRetentionData,
  getTransientTrendsData,
  saveRetention,
  updateRetention,
} from '@lib/services/retentionService';
import {
  hasValidEvents,
  hasValidRetentionEventAndFilters,
  substituteEmptyStringWithPlaceholder,
} from '../utils';
import TransientRetentionView from '../components/TransientRetentionView';
import { Node } from '@lib/domain/node';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import { replaceEmptyStringWithPlaceholderInExternalSegmentFilter } from '@lib/utils/common';

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
          startEvent: substituteEmptyStringWithPlaceholder(
            savedRetention.startEvent
          ),
          goalEvent: substituteEmptyStringWithPlaceholder(
            savedRetention.goalEvent
          ),
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

  const [loadingEventsAndProperties, setLoadingEventsAndProperties] =
    useState(false);
  const [eventList, setEventList] = useState<Node[]>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
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

  const [segmentFilters, setSegmentFilters] = useState<ExternalSegmentFilter[]>(
    savedRetention?.segmentFilter
      ? replaceEmptyStringWithPlaceholderInExternalSegmentFilter(
          savedRetention.segmentFilter
        )
      : [
          {
            condition: GroupConditions.OR,
            includes: true,
            custom: {
              condition: GroupConditions.AND,
              filters: [],
            },
            segments: [],
          },
        ]
  );

  useEffect(() => {
    if (hasValidRetentionEventAndFilters(retentionEvents, segmentFilters)) {
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
    const fetchEventProperties = async () => {
      const [eventPropertiesResult, events] = await Promise.all([
        getEventProperties(dsId as string),
        getNodes(dsId as string),
      ]);

      setEventList(events);
      setEventProperties(eventPropertiesResult);
      setLoadingEventsAndProperties(false);
    };
    setLoadingEventsAndProperties(true);
    fetchEventProperties();
  }, []);

  useEffect(() => {
    if (!hasValidRetentionEventAndFilters(retentionEvents, segmentFilters)) {
      return;
    }
    setInterval(0);
    setPageNumber(0);
    setTrigger((prevState: Boolean) => !prevState);
  }, [retentionEvents, granularity, dateFilter, segmentFilters]);

  useEffect(() => {
    if (!hasValidRetentionEventAndFilters(retentionEvents, segmentFilters)) {
      return;
    }

    const getTrendsData = async () => {
      const trendsData = await getTransientTrendsData(
        datasourceId!!,
        retentionEvents.startEvent,
        retentionEvents.goalEvent,
        dateFilter,
        granularity,
        interval,
        segmentFilters
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
    if (!hasValidRetentionEventAndFilters(retentionEvents, segmentFilters)) {
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
        pageSize,
        segmentFilters
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
          granularity,
          segmentFilters
        )
      : await saveRetention(
          dsId as string,
          retentionName,
          retentionEvents.startEvent,
          retentionEvents.goalEvent,
          dateFilter,
          granularity,
          segmentFilters
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

  const updateSegmentFilter = useCallback(
    (retentionSegmentFilter: ExternalSegmentFilter[]) => {
      setSegmentFilters(retentionSegmentFilter);
    },
    [segmentFilters]
  );

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
              segmentFilters={segmentFilters}
              updateSegmentFilter={updateSegmentFilter}
              loadingEventsAndProperties={loadingEventsAndProperties}
              eventList={eventList}
              eventProperties={eventProperties}
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
