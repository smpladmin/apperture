import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import {
  MetricAggregatePropertiesAggregation,
  MetricComponentAggregation,
} from '@lib/domain/metric';
import MetricViewFilterComponent from './MetricViewFilterCard';
import { getDisplayAggregationFunctionText } from '@components/Metric/util';
import { WhereFilter } from '@lib/domain/common';
type MetricViewComponentCardProps = {
  variable: string;
  reference: string;
  filters: WhereFilter[];
  conditions: string[];
  aggregation: MetricComponentAggregation;
};

const MetricViewComponentCard = ({
  variable,
  reference,
  filters,
  conditions,
  aggregation,
}: MetricViewComponentCardProps) => {
  return (
    <Flex
      data-testid="event-or-segment-component"
      justifyContent={'space-between'}
      alignItems={'center'}
      direction={'column'}
      borderRadius={'12px'}
      py={2}
    >
      <Flex width={'full'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={'#9999B6'}
          borderRadius={'2px'}
          textAlign="center"
          fontWeight={500}
          color={'black.100'}
          fontSize={'xs-10'}
          lineHeight={'12px'}
          justifyContent={'center'}
          alignItems={'center'}
          height={'16px'}
          width={'16px'}
        >
          {variable}
        </Flex>
        <Text
          data-testid={'event-or-segment-name'}
          color={'white'}
          fontSize={'xs-14'}
          fontWeight={500}
          lineHeight={'xs-18'}
          marginLeft={2}
        >
          {reference}
        </Text>
      </Flex>
      <Flex width={'full'} alignItems={'center'} gap={'2'}>
        <Text
          color={'white.DEFAULT'}
          fontSize={'xs-12'}
          lineHeight={'xs-16'}
          fontWeight={'400'}
          marginLeft={6}
          borderRadius={4}
        >
          {getDisplayAggregationFunctionText(aggregation.functions)}
        </Text>
        {Object.values(MetricAggregatePropertiesAggregation).includes(
          aggregation.functions as any
        ) ? (
          <>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={'400'}
              color={'white.DEFAULT'}
            >
              {'of'}
            </Text>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={'400'}
              color={'white.DEFAULT'}
              wordBreak={'break-word'}
            >
              {aggregation.property}
            </Text>
          </>
        ) : null}
      </Flex>
      {Boolean(filters.length) &&
        filters.map((filter: WhereFilter, index: number) => (
          <MetricViewFilterComponent
            condition={filter.condition}
            operand={filter.operand}
            key={index}
            operator={filter.operator}
            values={filter.values}
          />
        ))}
    </Flex>
  );
};

export default MetricViewComponentCard;
