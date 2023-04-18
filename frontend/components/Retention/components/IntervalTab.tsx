import { Box, Flex, Text } from '@chakra-ui/react';
import DateFilter from '@components/Date/DateFilter';
import { DateFilterType } from '@lib/domain/common';
import dayjs from 'dayjs';
import { CaretLeft, CaretRight } from 'phosphor-react';
import React, { useState } from 'react';
import { start } from 'repl';

export const IntervalTab = ({
  interval,
  setInterval,
  dateFilter,
  granularity,
}: any) => {
  const handleClick = (index: any) => {
    setInterval(index);
  };
  const computeIntervalLength = () => {
    if (dateFilter.type == DateFilterType.LAST) {
      return dateFilter.filter.days;
    } else {
      return dayjs(dateFilter.filter.end_date).diff(
        dayjs(dateFilter.filter.start_date),
        'days'
      );
    }
  };
  console.log(computeIntervalLength());
  const data = [
    { text: 'Day 0' },
    { text: 'Day 1' },
    { text: 'Day 2' },
    { text: 'Day 3' },
  ];
  return (
    <Flex flexDirection={'column'} width={'full'}>
      <Flex
        flexDirection={'row'}
        borderWidth={'0 0 1px 0'}
        borderColor={'grey.400'}
        borderStyle={'solid'}
      >
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          px={2}
          borderWidth={'0 1px 0 0'}
          borderColor={'grey.400'}
          borderStyle={'solid'}
        >
          <CaretLeft size={16} />
        </Flex>
        <Flex flexGrow={'1'}>
          {data.map((d, index) => {
            return (
              <Flex
                key={index}
                w={24}
                h={16}
                px={4}
                py={3}
                gap={2}
                flexDir={'column'}
                borderWidth={'0 1px 0 0'}
                borderColor={'grey.400'}
                borderStyle={'solid'}
                backgroundColor={interval === index ? 'white' : 'white.500'}
                onClick={() => handleClick(index)}
                cursor={'pointer'}
                borderBottom={interval === index ? 'black 3px solid' : 'none'}
              >
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'lh-135'}
                  fontWeight={'500'}
                  color={interval === index ? 'black' : 'grey.500'}
                >
                  {d.text}
                </Text>
                <Text
                  lineHeight={'lh-135'}
                  fontSize={'xs-12'}
                  fontWeight={'500'}
                  color={interval === index ? 'grey.800' : 'grey.600'}
                >
                  100%
                </Text>
              </Flex>
            );
          })}
        </Flex>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          px={2}
          borderWidth={'0 0 0 1px'}
          borderColor={'grey.400'}
          borderStyle={'solid'}
        >
          <CaretRight size={16} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default IntervalTab;
