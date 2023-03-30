import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import {
  MetricAggregatePropertiesAggregation,
  MetricComponentAggregation,
} from '@lib/domain/metric';
import { getDisplayAggregationFunctionText } from '@components/Metric/util';
import { WhereFilter } from '@lib/domain/common';
import ViewFilter from '@components/StepFilters/ViewFilter';

type MetricViewComponentCardProps = {
  definition: string;
  variable: string;
  reference: string;
  filters: WhereFilter[];
  aggregation: MetricComponentAggregation;
};

const MetricViewComponentCard = ({
  definition,
  variable,
  reference,
  filters,
  aggregation,
}: MetricViewComponentCardProps) => {
  return (
    <Flex data-testid="event-or-segment-component" direction={'column'} p={'3'}>
      <Flex gap={'2'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={definition ? 'gray.400' : 'blue.500'}
          p={2}
          height={2}
          width={2}
          borderRadius={'4px'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text
            fontSize={'xs-10'}
            lineHeight={'lh-130'}
            color={'white.DEFAULT'}
          >
            {variable}
          </Text>
        </Flex>

        <Text
          fontSize={'xs-14'}
          fontWeight={'500'}
          lineHeight={'lh-135'}
          data-testid={'metric-event'}
        >
          {reference}
        </Text>
      </Flex>

      <Flex
        width={'full'}
        alignItems={'center'}
        gap={'1'}
        data-testid={'aggregation-function'}
        pl={'6'}
        py={'1'}
      >
        <Text
          fontSize={'xs-12'}
          lineHeight={'lh-135'}
          fontWeight={'400'}
          color={'grey.500'}
        >
          {'in'}
        </Text>
        <Text
          fontSize={'xs-12'}
          lineHeight={'lh-135'}
          fontWeight={'400'}
          color={'grey.500'}
        >
          {getDisplayAggregationFunctionText(aggregation.functions)}
        </Text>
        {Object.values(MetricAggregatePropertiesAggregation).includes(
          aggregation.functions as any
        ) ? (
          <>
            <Text
              fontSize={'xs-12'}
              lineHeight={'lh-135'}
              fontWeight={'400'}
              color={'grey.500'}
            >
              {'of'}
            </Text>
            <Text
              fontSize={'xs-12'}
              lineHeight={'lh-135'}
              fontWeight={'400'}
              color={'grey.500'}
              wordBreak={'break-word'}
            >
              {aggregation.property}
            </Text>
          </>
        ) : null}
      </Flex>
      {Boolean(filters.length) &&
        filters.map((filter: WhereFilter, index: number) => (
          <ViewFilter key={index} filter={filter} />
        ))}
    </Flex>
  );
};

export default MetricViewComponentCard;
