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
import { MapContext } from '@lib/contexts/mapContext';
import MetricComponentCard from './MetricComponentCard';
import { getEventProperties, getNodes } from '@lib/services/datasourceService';
import _ from 'lodash';
import { computeMetric } from '@lib/services/metricService';

type CreateMetricActionProps = {};

const CreateMetricAction = () => {
  const [metricName, setMetricName] = useState('Untitled Metric');
  const [metricDefinition, setmetricDefinition] = useState('A');
  const router = useRouter();

  const { dsId } = router.query;

  const [eventList, setEventList] = useState<string[]>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);
  const [loadingEventsList, setLoadingEventsList] = useState(false);
  const [aggregates, setAggregates] = useState<any[]>([
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

      setEventList(events.map((i) => i.name));
      setEventProperties([...eventPropertiesResult]);
      setLoadingEventProperties(false);
      setLoadingEventsList(false);
    };
    setLoadingEventProperties(true);
    setLoadingEventsList(true);
    fetchEventProperties();
  }, []);

  const updateAggregate = (variable: string, updatedValue: any) => {
    setAggregates(
      aggregates.map((aggregate) =>
        aggregate.variable == variable
          ? _.merge(aggregate, updatedValue)
          : aggregate
      )
    );
  };

  const addAggregate = () => {
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
  };

  useEffect(() => {
    const fetchMetric = async (aggregates: any) => {
      const result = await computeMetric(
        dsId as string,
        metricDefinition as string,
        aggregates,
        []
      );
    };
    if (
      aggregates.every(
        (aggregate) =>
          aggregate.reference_id &&
          aggregate.variable &&
          aggregate.filters.length &&
          aggregate.filters.every((filter: any) => filter.values.length)
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
        />

        <Button
          borderRadius={'50'}
          _disabled={{
            bg: 'black.30',
            pointerEvents: 'none',
          }}
          data-testid={'save'}
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
          px={4}
          marginBottom={4}
          data-testid={'metric-definition'}
          background="grey.10"
        />
        <Divider orientation="horizontal" borderColor={BASTILLE} opacity={1} />
      </Flex>

      <Flex direction={'column'} gap={3} mt={{ base: '2', md: '4' }}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text fontSize={'xs-12'} color={'grey.200'}>
            EVENTS & SEGMENT
          </Text>
          <Button
            data-testid={'add-button'}
            variant="unstyled"
            rounded={'full'}
            size={'md'}
            color={'white.DEFAULT'}
            onClick={addAggregate}
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
          />
        ))}
      </Flex>
    </>
  );
};

export default CreateMetricAction;
