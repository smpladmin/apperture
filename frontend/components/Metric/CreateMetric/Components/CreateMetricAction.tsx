import { Button, Divider, Flex, Input, Text } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { BASTILLE } from '@theme/index';
import { useRouter } from 'next/router';
import MetricComponentCard from './MetricComponentCard';
import {
  computeMetric,
  validateMetricFormula,
} from '@lib/services/metricService';
import {
  MetricAggregate,
  Metric,
  MetricComponentVariant,
  ComputedMetric,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { cloneDeep, isEqual } from 'lodash';
import { Node } from '@lib/domain/node';
import {
  isValidAggregates,
  replaceEmptyStringPlaceholder,
} from '@components/Metric/util';
import { DateFilterObj, WhereFilter } from '@lib/domain/common';

type CreateMetricActionProps = {
  setMetric: Function;
  savedMetric: Metric | undefined;
  metricName: string;
  setCanSaveMetric: Function;
  setIsLoading: Function;
  loadingEventsAndProperties: boolean;
  eventProperties: string[];
  eventList: Node[];
  breakdown: string[];
  aggregates: MetricAggregate[];
  setAggregates: Function;
  dateFilter: DateFilterObj;
  metricDefinition: string;
  setMetricDefinition: Function;
};

const CreateMetricAction = ({
  setMetric,
  savedMetric,
  metricName,
  setCanSaveMetric,
  setIsLoading,
  loadingEventsAndProperties,
  eventProperties,
  eventList,
  breakdown,
  aggregates,
  setAggregates,
  dateFilter,
  metricDefinition,
  setMetricDefinition,
}: CreateMetricActionProps) => {
  const [debouncedDefinition, setDebouncedDefinition] = useState(
    savedMetric?.function || ''
  );
  const router = useRouter();

  const dsId = savedMetric?.datasourceId || router.query.dsId;

  const [isValidDefinition, setIsValidDefinition] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMetricDefinition(debouncedDefinition);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedDefinition]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedDefinition(e.target.value);
  };

  const updateAggregate = useCallback(
    (variable: string, updatedValue: WhereFilter) => {
      setAggregates(
        aggregates.map((aggregate) =>
          aggregate.variable == variable
            ? { ...aggregate, ...updatedValue }
            : aggregate
        )
      );
    },
    [aggregates]
  );

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
          aggregations: {
            functions: MetricBasicAggregation.TOTAL,
            property: '',
          },
        },
      ]);
    }
  };

  const removeAggregate = (index: number) => {
    let toUpdateAggregates = cloneDeep(aggregates);
    toUpdateAggregates.splice(index, 1);

    toUpdateAggregates = toUpdateAggregates.map((aggregate, index) => {
      return { ...aggregate, variable: String.fromCharCode(65 + index) };
    });
    setAggregates(toUpdateAggregates);
  };

  useEffect(() => {
    if (!isValidAggregates(aggregates)) return;

    const fetchMetric = async (aggregates: MetricAggregate[]) => {
      const processedAggregate = replaceEmptyStringPlaceholder(
        cloneDeep(aggregates)
      );
      const result: ComputedMetric[] = await computeMetric(
        dsId as string,
        metricDefinition && metricDefinition.length
          ? metricDefinition.replace(/\s*/g, '')
          : aggregates.map((aggregate) => aggregate.variable).join(','),
        processedAggregate,
        breakdown,
        dateFilter
      );

      setMetric(result);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchMetric(aggregates);
  }, [aggregates, metricDefinition, breakdown, dateFilter]);

  useEffect(() => {
    // check for valid metric definition
    const variableList = aggregates.map((aggregate) => aggregate.variable);
    const handleValidDefinition = async (
      metricDefinition: string,
      variableList: string[]
    ) => {
      const isValidFormula: boolean = await validateMetricFormula(
        metricDefinition,
        variableList
      );
      setIsValidDefinition(isValidFormula);
    };

    handleValidDefinition(metricDefinition, variableList);
  }, [aggregates, metricDefinition]);

  useEffect(() => {
    // enable save metric button when aggregate, metric name or definition changes
    if (
      isValidAggregates(aggregates) &&
      isValidDefinition &&
      (!isEqual(savedMetric?.aggregates, aggregates) ||
        savedMetric?.function != metricDefinition ||
        savedMetric?.name !== metricName)
    ) {
      setCanSaveMetric(true);
    } else {
      setCanSaveMetric(false);
    }
  }, [aggregates, metricDefinition, metricName, isValidDefinition]);

  return (
    <>
      <Flex direction={'column'} mt={'8'}>
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
          value={debouncedDefinition}
          onChange={handleTextChange}
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
        {aggregates.map((aggregate, index) => (
          <MetricComponentCard
            index={index}
            variable={aggregate.variable}
            eventList={eventList}
            key={aggregate.variable}
            eventProperties={eventProperties}
            loadingEventsAndProperties={loadingEventsAndProperties}
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
