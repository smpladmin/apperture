import { Box, Flex, Text } from '@chakra-ui/react';
import { SegmentFilterConditions } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type FilterConditionsProps = {
  conditions: SegmentFilterConditions[];
  index: number;
  updateGroupsState: Function;
};

const FilterConditions = ({
  conditions,
  index,
  updateGroupsState,
}: FilterConditionsProps) => {
  const [isFilterConditionsListOpen, setIsFilterConditionsListOpen] =
    useState(false);

  const updateFilterConditions = (value: SegmentFilterConditions) => {
    const newConditions = conditions.map((condition: SegmentFilterConditions) =>
      condition === SegmentFilterConditions.WHERE ? condition : value
    );
    updateGroupsState(false, newConditions);
    setIsFilterConditionsListOpen(false);
  };
  const filterCondtionsValues = [
    SegmentFilterConditions.AND,
    SegmentFilterConditions.OR,
  ];
  const filterConditionsRef = useRef(null);
  useOnClickOutside(filterConditionsRef, () =>
    setIsFilterConditionsListOpen(false)
  );

  return (
    <Box w={'12'} ref={filterConditionsRef} position="relative">
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        color={'grey.200'}
        textAlign={'right'}
        cursor={'pointer'}
        onClick={() => setIsFilterConditionsListOpen(true)}
        data-testid={'filter-condition'}
      >
        {conditions[index]}
      </Text>
      {isFilterConditionsListOpen &&
      conditions[index] !== SegmentFilterConditions.WHERE ? (
        <Box
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          overflowY={'auto'}
        >
          {
            <Flex direction={'column'} minW={'15'}>
              {filterCondtionsValues.map((value) => {
                return (
                  <Flex
                    p={'2'}
                    key={value}
                    _hover={{
                      bg: 'white.100',
                    }}
                    data-testid={'filter-conditions-options'}
                    onClick={() => updateFilterConditions(value)}
                    cursor={'pointer'}
                  >
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'medium'}
                    >
                      {value}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          }
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterConditions;
