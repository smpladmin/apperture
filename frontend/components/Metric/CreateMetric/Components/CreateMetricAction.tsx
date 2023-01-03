import {
  Button,
  Divider,
  Flex,
  IconButton,
  Input,
  Switch,
  Text,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { BASTILLE, BLACK_RUSSIAN } from '@theme/index';

import { useRouter } from 'next/router';
import MetricComponentCard from './MetricComponentCard';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import { computeMetric } from '@lib/services/metricService';
import { EventOrSegmentComponent, MetricEventFilter } from '@lib/domain/metric';

type CreateMetricActionProps = {
  setMetric: Function;
};

const CreateMetricAction = ({ setMetric }: CreateMetricActionProps) => {
  const [metricName, setMetricName] = useState('Untitled Metric');
  const [metricDefinition, setmetricDefinition] = useState('A');
  const router = useRouter();

  const { dsId } = router.query;

  const [eventList, setEventList] = useState<string[]>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);
  const [loadingEventsList, setLoadingEventsList] = useState(false);
  const [aggregates, setAggregates] = useState<EventOrSegmentComponent[]>([
    {
      variable: 'A',
      reference_id: '',
      function: 'count',
      variant: '',
      filters: [],
      conditions: [],
      aggregations: { functions: 'count', property: '' },
    },
  ]);
  useEffect(() => {
    const fetchEventProperties = async () => {
      const [eventPropertiesResult, events] = await Promise.all([
        getEventProperties(dsId as string),
        getNodes(dsId as string),
      ]);

      setEventList(events.map((i) => i.id));
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
          variant: '',
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
        []
      );
      if (result) {
        setMetric({
          data: result.metric,
          definition: metricDefinition,
        });
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
    }
  }, [aggregates, metricDefinition]);

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
            router.back();
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
          disabled={true}
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
        {aggregates.map(({ variable }) => (
          <MetricComponentCard
            variable={variable}
            eventList={eventList}
            key={variable}
            eventProperties={eventProperties}
            loadingEventProperties={loadingEventProperties}
            loadingEventsList={loadingEventsList}
            updateAggregate={updateAggregate}
            removeAggregate={removeAggregate}
          />
        ))}
      </Flex>
    </>
  );
};

export default CreateMetricAction;
