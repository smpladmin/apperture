import { Flex, useToast } from '@chakra-ui/react';
import ActionPanel from '@components/EventsLayout/ActionPanel';
import ViewPanel from '@components/EventsLayout/ViewPanel';
import {
  ComputedMetric,
  Metric,
  MetricAggregate,
  MetricVariant,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import React, { useEffect, useState } from 'react';
import { Node } from '@lib/domain/node';
import { useRouter } from 'next/router';
import { getCountOfValidAggregates } from '../util';
import { DateFilterObj } from '@lib/domain/common';
import ActionHeader from '@components/EventsLayout/ActionHeader';
import { saveMetric, updateMetric } from '@lib/services/metricService';
import TransientMetricView from '../components/TransientMetricView';
import CreateMetricAction from './CreateMetricAction';

const Metric = ({ savedMetric }: { savedMetric?: Metric }) => {
  const [metric, setMetric] = useState<ComputedMetric[]>([]);
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
        variant: MetricVariant.UNDEFINED,
        filters: [],
        conditions: [],
        aggregations: { functions: MetricBasicAggregation.TOTAL, property: '' },
      },
    ]
  );
  const [metricName, setMetricName] = useState(
    savedMetric?.name || 'Untitled Metric'
  );
  const [metricDefinition, setMetricDefinition] = useState(
    savedMetric?.function || ''
  );
  const [dateFilter, setDateFilter] = useState<DateFilterObj>({
    filter: savedMetric?.dateFilter?.filter || null,
    type: savedMetric?.dateFilter?.type || null,
  });
  const [isMetricBeingEdited, setIsMetricBeingEdited] = useState(false);

  const router = useRouter();
  const dsId = savedMetric?.datasourceId || router.query.dsId;
  const { metricId } = router.query;

  useEffect(() => {
    if (router.pathname.includes('/metric/edit')) setIsMetricBeingEdited(true);
  }, []);

  useEffect(() => {
    if (getCountOfValidAggregates(aggregates) >= 1) {
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

  const handleSaveOrUpdateMetric = async () => {
    const { data, status } = isMetricBeingEdited
      ? await updateMetric(
          metricId as string,
          metricName,
          dsId as string,
          metricDefinition,
          aggregates,
          breakdown,
          dateFilter
        )
      : await saveMetric(
          metricName,
          dsId as string,
          metricDefinition,
          aggregates,
          breakdown,
          dateFilter
        );

    setCanSaveMetric(false);

    if (status === 200) {
      router.push({
        pathname: '/analytics/metric/view/[metricId]',
        query: { metricId: data?._id || metricId, dsId },
      });
    } else {
      setCanSaveMetric(true);
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
      <ActionHeader
        handleGoBack={() => router.back()}
        name={metricName}
        setName={setMetricName}
        handleSave={handleSaveOrUpdateMetric}
        isSaveButtonDisabled={!canSaveMetric}
      />
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={'5'}
        flexGrow={1}
        bg={'white.400'}
      >
        <ActionPanel>
          <CreateMetricAction
            setMetric={setMetric}
            savedMetric={savedMetric}
            metricName={metricName}
            setCanSaveMetric={setCanSaveMetric}
            setIsLoading={setIsLoading}
            loadingEventsAndProperties={loadingEventsAndProperties}
            eventList={eventList}
            eventProperties={eventProperties}
            breakdown={breakdown}
            setBreakdown={setBreakdown}
            aggregates={aggregates}
            setAggregates={setAggregates}
            dateFilter={dateFilter}
            metricDefinition={metricDefinition}
            setMetricDefinition={setMetricDefinition}
          />
        </ActionPanel>
        <ViewPanel>
          <TransientMetricView
            metric={metric}
            isLoading={isLoading}
            breakdown={breakdown}
            showEmptyState={showEmptyState}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
        </ViewPanel>
      </Flex>
    </Flex>
  );
};

export default Metric;
