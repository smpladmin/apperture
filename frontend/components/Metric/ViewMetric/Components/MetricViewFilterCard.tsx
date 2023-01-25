import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import indent from '@assets/icons/indent.svg';
import Image from 'next/image';

type MetricViewFilterComponentProps = {
  condition: string;
  operator: string;
  operand: string;
  values: string[];
};

const MetricViewFilterComponent = ({
  condition,
  operator,
  operand,
  values,
}: MetricViewFilterComponentProps) => {
  const getValuesText = (values: string[]) => {
    if (!values.length) return 'Select value';
    if (values.length <= 2) return values.join(', ');
    return `${values[0]}, ${values[1]} or ${values.length - 2} more`;
  };
  return (
    <Flex
      data-testid={'event-filter-component'}
      width={'full'}
      _first={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
      px={10}
      direction={'column'}
    >
      <Text fontSize={'xs-12'} lineHeight={'xs-14'} color={'grey.100'}>
        {condition}
      </Text>
      <Flex width={'full'} justifyContent={'space-between'}>
        <Flex
          fontSize={'xs-12'}
          lineHeight={'xs-14'}
          color={'white'}
          fontWeight={500}
          marginLeft={6}
          position="relative"
          cursor={'pointer'}
          p={1}
          borderRadius={4}
          width={'max-content'}
        >
          <Box position={'absolute'} left={-6}>
            <Image src={indent} />
          </Box>
          {operand}
        </Flex>
      </Flex>
      <Flex marginLeft={6} gap={2}>
        <Text
          fontSize={'xs-12'}
          p={1}
          lineHeight={'xs-14'}
          cursor={'not-allowed'}
          borderRadius={4}
          color={'grey.100'}
        >
          {operator}
        </Text>
        <Box position={'relative'}>
          <Text
            data-testid={'event-filter-values'}
            p={1}
            fontSize={'xs-12'}
            borderRadius={4}
            lineHeight={'xs-14'}
            cursor={'pointer'}
            color={'white'}
          >
            {getValuesText(values)}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default MetricViewFilterComponent;
