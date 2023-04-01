import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import {
  MetricAggregate,
  MetricAggregatePropertiesAggregation,
  MetricComponentAggregation,
} from '@lib/domain/metric';
import {
  COLOR_PALLETE_5,
  getDisplayAggregationFunctionText,
  useColorFromPallete,
} from '@components/Metric/util';
import { WhereFilter } from '@lib/domain/common';
import ViewFilter from '@components/StepFilters/ViewFilter';

type MetricViewComponentCardProps = {
  index: number;
  definition: string;
  variable: string;
  reference: string;
  filters: WhereFilter[];
  aggregation: MetricComponentAggregation;
  aggregates: MetricAggregate[];
  breakdown: string[];
};

const MetricViewComponentCard = ({
  index,
  definition,
  variable,
  reference,
  filters,
  aggregation,
  aggregates,
  breakdown,
}: MetricViewComponentCardProps) => {
  return (
    <Flex data-testid="event-or-segment-component" direction={'column'} p={'3'}>
      <Flex gap={'2'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={
            useColorFromPallete(aggregates, definition, breakdown)
              ? COLOR_PALLETE_5[index].hexaValue
              : 'grey.400'
          }
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
            fontWeight={'500'}
            color={
              useColorFromPallete(aggregates, definition, breakdown)
                ? 'white.DEFAULT'
                : 'grey.500'
            }
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
