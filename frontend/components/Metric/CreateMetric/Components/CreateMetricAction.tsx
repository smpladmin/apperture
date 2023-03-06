import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';
import { useRouter } from 'next/router';
import MetricComponentCard from './MetricComponentCard';
import {
  computeMetric,
  saveMetric,
  updateMetric,
  validateMetricFormula,
} from '@lib/services/metricService';
import {
  DateRangeType,
  MetricAggregate,
  Metric,
  MetricComponentVariant,
  MetricEventFilter,
  ComputedMetric,
} from '@lib/domain/metric';
import { cloneDeep, isEqual } from 'lodash';
import { Node } from '@lib/domain/node';
import {
  isValidAggregates,
  replaceEmptyStringPlaceholder,
} from '@components/Metric/util';

type CreateMetricActionProps = {
  setMetric: Function;
  dateRange: DateRangeType | null;
  savedMetric: Metric | undefined;
  canSaveMetric: boolean;
  setCanSaveMetric: Function;
  setIsLoading: Function;
  loadingEventsAndProperties: boolean;
  eventProperties: string[];
  eventList: Node[];
  breakdown: string[];
  aggregates: MetricAggregate[];
  setAggregates: Function;
};

const CreateMetricAction = ({
  setMetric,
  dateRange,
  savedMetric,
  canSaveMetric,
  setCanSaveMetric,
  setIsLoading,
  loadingEventsAndProperties,
  eventProperties,
  eventList,
  breakdown,
  aggregates,
  setAggregates,
}: CreateMetricActionProps) => {
  const [metricName, setMetricName] = useState(
    savedMetric?.name || 'Untitled Metric'
  );
  const [metricDefinition, setmetricDefinition] = useState(
    savedMetric?.function || ''
  );
  const [debouncedDefinition, setDebouncedDefinition] = useState(
    savedMetric?.function || ''
  );
  const router = useRouter();

  const { metricId } = router.query;
  const dsId = savedMetric?.datasourceId || router.query.dsId;

  const [isValidDefinition, setIsValidDefinition] = useState<boolean>(true);
  const [isMetricBeingEdited, setIsMetricBeingEdited] = useState(false);

  useEffect(() => {
    if (router.pathname.includes('/metric/edit')) setIsMetricBeingEdited(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setmetricDefinition(debouncedDefinition);
    }, 600);

    return () => {
      clearTimeout(timer);
    };
  }, [debouncedDefinition]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedDefinition(e.target.value);
  };

  const updateAggregate = useCallback(
    (variable: string, updatedValue: MetricEventFilter) => {
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
          aggregations: { functions: 'count', property: '' },
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

  const handleSave = async () => {
    const { data, status } = isMetricBeingEdited
      ? await updateMetric(
          metricId as string,
          metricName,
          dsId as string,
          metricDefinition,
          aggregates,
          breakdown
        )
      : await saveMetric(
          metricName,
          dsId as string,
          metricDefinition,
          aggregates,
          breakdown
        );

    if (status === 200)
      router.push({
        pathname: '/analytics/metric/view/[metricId]',
        query: { metricId: data?._id || metricId, dsId },
      });

    setCanSaveMetric(false);
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
        dateRange?.startDate,
        dateRange?.endDate
      );

      setMetric(result);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchMetric(aggregates);
  }, [aggregates, metricDefinition, dateRange, breakdown]);

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
        saveMetric?.name !== metricName)
    ) {
      setCanSaveMetric(true);
    } else {
      setCanSaveMetric(false);
    }
  }, [aggregates, metricDefinition, metricName, isValidDefinition]);

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
              pathname: '/analytics/metric/list/[dsId]',
              query: { dsId },
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
