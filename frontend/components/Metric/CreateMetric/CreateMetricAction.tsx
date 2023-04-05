import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MetricComponentCard from '../components/MetricComponentCard';
import {
  computeMetric,
  validateMetricFormula,
} from '@lib/services/metricService';
import {
  MetricAggregate,
  Metric,
  MetricVariant,
  ComputedMetric,
  MetricBasicAggregation,
} from '@lib/domain/metric';
import { cloneDeep, debounce, isEqual } from 'lodash';
import { Node } from '@lib/domain/node';
import {
  enableBreakdown,
  getCountOfValidAggregates,
  isValidAggregates,
  replaceEmptyStringPlaceholder,
} from '@components/Metric/util';
import { DateFilterObj, WhereFilter } from '@lib/domain/common';
import Card from '@components/Card';
import { Function, Plus, UsersFour } from 'phosphor-react';
import AddBreakdown from '../components/AddBreakdown';
import { BLACK_DEFAULT, GREY_600 } from '@theme/index';
import SegmentFilter from '../components/SegmentFilter';

const DEBOUNCE_WAIT_TIME = 800;

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
  setBreakdown: Function;
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
  setBreakdown,
  aggregates,
  setAggregates,
  dateFilter,
  metricDefinition,
  setMetricDefinition,
}: CreateMetricActionProps) => {
  const router = useRouter();
  const dsId = savedMetric?.datasourceId || router.query.dsId;

  const [isValidDefinition, setIsValidDefinition] = useState<boolean>(true);

  const handleDefinitionChange = debounce(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMetricDefinition(e.target.value);
    },
    DEBOUNCE_WAIT_TIME
  );

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
          variant: MetricVariant.UNDEFINED,
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
    // remove breakdown if multiple aggregates are present without metric definition
    // or if no aggregate is present
    const isNoAggregatePresent = aggregates.length === 0;
    if (!enableBreakdown(aggregates, metricDefinition) || isNoAggregatePresent)
      setBreakdown([]);
  }, [aggregates, metricDefinition]);

  useEffect(() => {
    if (!isValidAggregates(aggregates)) return;
    const abortController = new AbortController();
    const signal = abortController.signal;

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
        dateFilter,
        signal
      );

      setMetric(result);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchMetric(aggregates);

    return () => abortController.abort();
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

    const checkMetricDefinitionAndAggregateCount = (
      metricDefinition: string,
      aggregates: MetricAggregate[]
    ) => {
      /*
        enable save metric if either of condition satisfies-
        a. has metric definition
          1. single aggregate - True
          2. multiple aggregate - True

        b. has no metric definition
          1. single aggregate - True
          2. multiple aggregate - False

      */
      if (metricDefinition) return true;

      if (!metricDefinition && getCountOfValidAggregates(aggregates) === 1)
        return true;

      return false;
    };

    const enableSaveMetricButton =
      isValidAggregates(aggregates) &&
      checkMetricDefinitionAndAggregateCount(metricDefinition, aggregates) &&
      isValidDefinition &&
      (!isEqual(savedMetric?.aggregates, aggregates) ||
        !isEqual(savedMetric?.breakdown, breakdown) ||
        savedMetric?.function != metricDefinition ||
        savedMetric?.name !== metricName);

    if (enableSaveMetricButton) {
      setCanSaveMetric(true);
    } else {
      setCanSaveMetric(false);
    }
  }, [aggregates, metricDefinition, metricName, isValidDefinition, breakdown]);

  const functionBoxColor = metricDefinition ? 'blue.500' : 'grey.400';

  return (
    <Card>
      <Flex direction={'column'} width={'full'} gap={'6'}>
        <Flex direction={'column'} gap={3}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'lh-135'}
            color={'grey.500'}
            px={'2'}
            py={'1'}
          >
            Metric Definition
          </Text>
          <InputGroup>
            <InputLeftElement>
              <Flex>
                <Box
                  mt={'2px'}
                  bg={functionBoxColor}
                  height={'18px'}
                  width={'18px'}
                  borderRadius={'4'}
                  padding={'2px'}
                >
                  <Function color="white" size={'14'} weight="bold" />
                </Box>
              </Flex>
            </InputLeftElement>
            <Input
              pr={'4'}
              type={'text'}
              placeholder={'example A/B'}
              fontSize={'xs-14'}
              variant="unstyled"
              lineHeight={{ base: 'sh-20', md: 'sh-32' }}
              textColor={'black.DEFAULT'}
              defaultValue={metricDefinition}
              onChange={handleDefinitionChange}
              borderColor={'white.200'}
              borderRadius={'8'}
              borderStyle={'solid'}
              borderWidth={'1px'}
              fontWeight={'medium'}
              height="11"
              px={4}
              data-testid={'metric-definition'}
              background="grey.10"
              _focus={{
                border: '1px solid black',

                color: 'black.DEFAULT',
              }}
              _active={{
                border: '1px solid black',
                fontWeight: 'medium',
                color: 'black.DEFAULT',
              }}
            />
          </InputGroup>
        </Flex>

        <Flex direction={'column'} gap={'3'}>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'lh-135'}
              color={'grey.500'}
              px={'2'}
              py={'1'}
            >
              Events & Segments
            </Text>
            <Button
              h={5.5}
              minW={5.5}
              w={5.5}
              p={0}
              data-testid={'add-event-button'}
              onClick={addAggregate}
              cursor={'pointer'}
              variant={'secondary'}
            >
              <Plus size={14} color={BLACK_DEFAULT} weight={'bold'} />
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
              aggregate={aggregate}
              metricDefinition={metricDefinition}
              breakdown={breakdown}
            />
          ))}
        </Flex>

        <SegmentFilter />

        <AddBreakdown
          metricDefinition={metricDefinition}
          aggregates={aggregates}
          breakdown={breakdown}
          setBreakdown={setBreakdown}
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventsAndProperties}
        />
      </Flex>
    </Card>
  );
};

export default CreateMetricAction;
