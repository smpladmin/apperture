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
import Card from '@components/Card';
import { Function } from 'phosphor-react';

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

  const boxColor = debouncedDefinition ? 'blue.500' : 'gray.400';

  return (
    <>
      <Card>
        <Flex direction={'column'} width={'full'}>
          <Flex direction={'column'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'lh-135'}
              color={'grey.500'}
              pb={'3'}
              px={'3'}
            >
              Metric Definition
            </Text>
            <InputGroup>
              <InputLeftElement>
                <Flex>
                  <Box
                    mt={'2px'}
                    bg={boxColor}
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
                value={debouncedDefinition}
                onChange={handleTextChange}
                borderColor={'white.200'}
                borderRadius={'8'}
                borderStyle={'solid'}
                borderWidth={'1px'}
                fontWeight={'medium'}
                height="11"
                px={4}
                marginBottom={4}
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
          <Flex direction={'column'}>
            <Flex justifyContent={'space-between'} alignItems={'center'}>
              <Text
                fontSize={'xs-12'}
                lineHeight={'lh-135'}
                color={'grey.500'}
                pb={'3'}
                px={'3'}
              >
                Events & Segments
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
        </Flex>
      </Card>
    </>
  );
};

export default CreateMetricAction;
