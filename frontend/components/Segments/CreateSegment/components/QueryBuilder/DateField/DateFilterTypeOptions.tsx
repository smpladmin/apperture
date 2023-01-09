import { Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { DateFilterTypeOptions } from '@components/Segments/util';
import { SegmentDateFilterType } from '@lib/domain/segment';
import React from 'react';

type DateFilterTypeProps = {
  selectedDateFilterType: SegmentDateFilterType;
  setSelectedDateFIlterType: Function;
};

const DateFilterType = ({
  selectedDateFilterType,
  setSelectedDateFIlterType,
}: DateFilterTypeProps) => {
  return (
    <RadioGroup
      value={selectedDateFilterType}
      onChange={(value: SegmentDateFilterType) => {
        setSelectedDateFIlterType(value);
      }}
    >
      <Flex gap={'5'} direction={'row'}>
        {DateFilterTypeOptions.map((dateFilterItemType) => {
          const isSelected = dateFilterItemType.id === selectedDateFilterType;
          return (
            <Flex
              key={dateFilterItemType.id}
              as={'label'}
              w={'14'}
              borderRadius={'100'}
              bg={isSelected ? 'black.100' : ''}
              px={'3'}
              py={'2'}
              cursor={'pointer'}
              data-testid={'date-filter-item'}
              justifyContent={'center'}
            >
              <Text
                color={isSelected ? 'white.DEFAULT' : 'black.100'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
              >
                {dateFilterItemType.label}
              </Text>
              <Radio value={dateFilterItemType.id} hidden />
            </Flex>
          );
        })}
      </Flex>
    </RadioGroup>
  );
};

export default DateFilterType;
