import { Flex } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import {
  DateRangeType,
  ComputedMetric,
  Metric,
  MetricAggregate,
  MetricComponentVariant,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import React, { useEffect, useState } from 'react';
import CreateMetricAction from './Components/CreateMetricAction';
import TransientMetricView from './Components/TransientMetricView';
import { Node } from '@lib/domain/node';
import { useRouter } from 'next/router';
import { getCountOfAggregates } from '../util';

const Metric = ({ savedMetric }: { savedMetric?: Metric }) => {
  const [metric, setMetric] = useState<ComputedMetric[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType | null>(null);
  const [canSaveMetric, setCanSaveMetric] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(savedMetric));
  const [eventList, setEventList] = useState<Node[]>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventsAndProperties, setLoadingEventsAndProperties] =
    useState(false);
  const [breakdown, setBreakdown] = useState<string[]>(
    savedMetric?.breakdown || []
  );
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [aggregates, setAggregates] = useState<MetricAggregate[]>(
    savedMetric?.aggregates || [
      {
        variable: 'A',
        reference_id: '',
        function: 'count',
        variant: MetricComponentVariant.UNDEFINED,
        filters: [],
        conditions: [],
        aggregations: { functions: MetricBasicAggregation.TOTAL, property: '' },
      },
    ]
  );
  const router = useRouter();
  const dsId = savedMetric?.datasourceId || router.query.dsId;

  useEffect(() => {
    if (getCountOfAggregates(aggregates) >= 1) {
      setShowEmptyState(false);
    } else {
      setShowEmptyState(true);
    }
  }, [aggregates]);

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

  return (
    <Flex direction={{ base: 'column', md: 'row' }} h={'full'}>
      <ActionPanel>
        <CreateMetricAction
          setMetric={setMetric}
          dateRange={dateRange}
          savedMetric={savedMetric}
          canSaveMetric={canSaveMetric}
          setCanSaveMetric={setCanSaveMetric}
          setIsLoading={setIsLoading}
          loadingEventsAndProperties={loadingEventsAndProperties}
          eventList={eventList}
          eventProperties={eventProperties}
          breakdown={breakdown}
          aggregates={aggregates}
          setAggregates={setAggregates}
        />
      </ActionPanel>
      <ViewPanel>
        <TransientMetricView
          metric={metric}
          setDateRange={setDateRange}
          dateRange={dateRange}
          isLoading={isLoading}
          eventProperties={eventProperties}
          loadingEventsAndProperties={loadingEventsAndProperties}
          breakdown={breakdown}
          setBreakdown={setBreakdown}
          showEmptyState={showEmptyState}
        />
      </ViewPanel>
    </Flex>
  );
};

export default Metric;
