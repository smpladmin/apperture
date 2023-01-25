import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react';
import { MetricEventFilter } from '@lib/domain/metric';
import MetricViewFilterComponent from './MetricViewFilterCard';
type MetricViewComponentCardProps = {
  variable: string;
  reference: string;
  filters: MetricEventFilter[];
  conditions: string[];
};

const MetricViewComponentCard = ({
  variable,
  reference,
  filters,
  conditions,
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
          marginLeft={5}
        >
          {reference}
        </Text>
      </Flex>
      <Flex width={'full'} alignItems={'center'}>
        <Text
          color={'white'}
          fontSize={'xs-12'}
          lineHeight={'xs-16'}
          marginLeft={4}
          px={5}
          borderRadius={4}
        >
          Total Count
        </Text>
      </Flex>
      {Boolean(filters.length) &&
        filters.map((filter: MetricEventFilter, index: number) => (
          <MetricViewFilterComponent
            condition={conditions[index]}
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
