import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';

import { useRouter } from 'next/router';
import MetricComponentCard from './MetricComponentCard';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import {
  computeMetric,
  saveMetric,
  updateMetric,
} from '@lib/services/metricService';
import {
  DateRangeType,
  EventOrSegmentComponent,
  Metric,
  MetricComponentVariant,
  MetricEventFilter,
} from '@lib/domain/metric';
import { isEqual } from 'lodash';
import { Node } from '@lib/domain/node';

type CreateMetricActionProps = {
  setMetric: Function;
  dateRange: DateRangeType | null;
  savedMetric: Metric | undefined;
  canSaveMetric: boolean;
  setCanSaveMetric: Function;
  setIsLoading: Function;
};

const CreateMetricAction = ({
  setMetric,
  dateRange,
  savedMetric,
  canSaveMetric,
  setCanSaveMetric,
  setIsLoading,
}: CreateMetricActionProps) => {
  const [metricName, setMetricName] = useState(
    savedMetric?.name || 'Untitled Metric'
  );
  const [metricDefinition, setmetricDefinition] = useState(
    savedMetric?.function || 'A'
  );
  const router = useRouter();

  const { metricId } = router.query;
  const dsId = savedMetric?.datasourceId || router.query.dsId;
  const [eventList, setEventList] = useState<Node[]>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);
  const [loadingEventsList, setLoadingEventsList] = useState(false);
  const [aggregates, setAggregates] = useState<EventOrSegmentComponent[]>(
    savedMetric?.aggregates || [
      {
        variable: 'A',
        reference_id: '',
        function: 'count',
        variant: MetricComponentVariant.UNDEFINED,
        filters: [],
        conditions: [],
        aggregations: { functions: 'count', property: '' },
      },
    ]
  );
  useEffect(() => {
    const fetchEventProperties = async () => {
      const [eventPropertiesResult, events] = await Promise.all([
        getEventProperties(dsId as string),
        getNodes(dsId as string),
      ]);

      setEventList(events);
      setEventProperties([...eventPropertiesResult]);
      setLoadingEventProperties(false);
      setLoadingEventsList(false);
    };
    setLoadingEventProperties(true);
    setLoadingEventsList(true);
    fetchEventProperties();
  }, []);

  const updateAggregate = (
    variable: string,
    updatedValue: MetricEventFilter
  ) => {
    setAggregates(
      aggregates.map((aggregate) =>
        aggregate.variable == variable
          ? { ...aggregate, ...updatedValue }
          : aggregate
      )
    );
  };

  const addAggregate = () => {
    if (aggregates.every((aggregate) => aggregate.variant)) {
      const variable = String.fromCharCode(65 + aggregates.length);
      setAggregates([
        ...aggregates,
        {
          variable,
          reference_id: '',
          function: 'count',
          variant: MetricComponentVariant.UNDEFINED,
          filters: [],
          conditions: [],
          aggregations: { functions: 'count', property: '' },
        },
      ]);
    }
  };

  const removeAggregate = (variable: string) => {
    const updatedAggregates = aggregates.filter(
      (aggregate) => aggregate.variable !== variable
    );

    setAggregates(
      updatedAggregates.map((aggregate, index) => {
        return { ...aggregate, variable: String.fromCharCode(65 + index) };
      })
    );
  };

  const handleSave = async () => {
    let savedMetric;
    if (metricId) {
      // update the metric
      await updateMetric(
        metricId as string,
        metricName,
        dsId as string,
        metricDefinition,
        aggregates,
        []
      );
    } else {
      // save the metric
      savedMetric = await saveMetric(
        metricName,
        dsId as string,
        metricDefinition,
        aggregates,
        []
      );
    }
    router.push({
      pathname: '/analytics/metric/edit/[metricId]',
      query: { metricId: savedMetric?._id || metricId },
    });

    setCanSaveMetric(false);
  };

  useEffect(() => {
    const fetchMetric = async (aggregates: EventOrSegmentComponent[]) => {
      const processedAggregate = aggregates.map(
        (aggregate: EventOrSegmentComponent) => {
          const processedFilter = aggregate?.filters.map(
            (filter: MetricEventFilter) => {
              const processedValues = filter.values.map((value: string) =>
                value === '(empty string)' ? '' : value
              );
              return { ...filter, values: processedValues };
            }
          );
          return {
            ...aggregate,
            filters: processedFilter,
          };
        }
      );
      const result = await computeMetric(
        dsId as string,
        metricDefinition as string,
        processedAggregate,
        [],
        dateRange?.startDate,
        dateRange?.endDate
      );
      if (result) {
        setMetric({
          data: result.metric,
          definition: metricDefinition,
        });
        setIsLoading(false);
      } else {
        setMetric(null);
      }
    };
    if (
      aggregates.every(
        (aggregate) =>
          aggregate.reference_id &&
          aggregate.variable &&
          aggregate.filters.every(
            (filter: MetricEventFilter) => filter.values.length
          )
      )
    ) {
      fetchMetric(aggregates);
      if (
        aggregates &&
        aggregates.length &&
        (!isEqual(savedMetric?.aggregates, aggregates) ||
          savedMetric?.function != metricDefinition)
      ) {
        setCanSaveMetric(true);
      } else {
        setCanSaveMetric(false);
      }
    }
  }, [aggregates, metricDefinition, dateRange]);

  useEffect(() => {
    if (!canSaveMetric && savedMetric && metricName != savedMetric?.name) {
      setCanSaveMetric(true);
    }
  }, [metricName]);

  return (
    <>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <IconButton
          aria-label="close"
          variant={'primary'}
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'full'}
          color={'white.DEFAULT'}
          bg={'black.20'}
          onClick={() => {
            router.push({
              pathname: '/analytics/saved',
            });
          }}
          data-testid="back-button"
        />

        <Button
          borderRadius={'50'}
          _disabled={{
            bg: 'black.30',
            pointerEvents: 'none',
          }}
          data-testid={'save'}
          disabled={!canSaveMetric}
          onClick={handleSave}
        >
          <Text
            textAlign={'center'}
            color={BLACK_RUSSIAN}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            Save
          </Text>
        </Button>
      </Flex>

      <Flex direction={'column'} mt={'8'}>
        <Input
          pr={'4'}
          type={'text'}
          variant="flushed"
          fontSize={{ base: 'sh-20', md: 'sh-32' }}
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          value={metricName}
          focusBorderColor={'white.DEFAULT'}
          onChange={(e) => setMetricName(e.target.value)}
          borderColor={'grey.10'}
          px={0}
          data-testid={'metric-name'}
        />
        <Text fontSize={'xs-12'} color={'grey.200'} py="4">
          METRIC DEFINITION
        </Text>
        <Input
          pr={'4'}
          type={'text'}
          fontSize={'xs-14'}
          variant="unstyled"
          lineHeight={{ base: 'sh-20', md: 'sh-32' }}
          fontWeight={'semibold'}
          textColor={'white.DEFAULT'}
          value={metricDefinition}
          onChange={(e) => setmetricDefinition(e.target.value)}
          borderColor={'grey.10'}
          height="10"
          borderRadius={'25'}
          border={'1px solid grey.10'}
          px={4}
          marginBottom={4}
          data-testid={'metric-definition'}
          background="grey.10"
          _focus={{ border: '1px solid white' }}
          _active={{ border: '1px solid white' }}
        />
        <Divider orientation="horizontal" borderColor={BASTILLE} opacity={1} />
      </Flex>

      <Flex direction={'column'} gap={3} mt={{ base: '2', md: '4' }}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontSize={'xs-12'} color={'grey.200'}>
            EVENTS & SEGMENT
          </Text>
          <Button
            data-testid={'add-events-or-segments-button'}
            size={'xs'}
            color={'white.DEFAULT'}
            onClick={addAggregate}
            background={'none'}
            _hover={{ color: 'white', background: 'grey.300' }}
          >
            +
          </Button>
        </Flex>
        {aggregates.map((aggregate) => (
          <MetricComponentCard
            variable={aggregate.variable}
            eventList={eventList}
            key={aggregate.variable}
            eventProperties={eventProperties}
            loadingEventProperties={loadingEventProperties}
            loadingEventsList={loadingEventsList}
            updateAggregate={updateAggregate}
            removeAggregate={removeAggregate}
            savedAggregate={aggregate}
          />
        ))}
      </Flex>
    </>
  );
};

export default CreateMetricAction;
