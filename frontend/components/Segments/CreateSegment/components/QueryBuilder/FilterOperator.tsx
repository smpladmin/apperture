import { Box, Text, Flex } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentFilterOperatorsString,
  SegmentFilterOperatorsNumber,
  SegmentFilterOperatorsBool,
  SegmentFilterDataType,
  FilterType,
  WhereSegmentFilter,
  SegmentFilterOperators,
} from '@lib/domain/segment';
import React, { useState, useRef } from 'react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { capitalizeFirstLetter } from '@lib/utils/common';

type FilterOperatorProps = {
  filter: SegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  index: number;
};

const FilterOperator = ({
  filter,
  filters,
  index,
  updateGroupsState,
}: FilterOperatorProps) => {
  const [isFilterOperatorsListOpen, setIsFilterOperatorsListOpen] =
    useState(false);

  const filterOperatorsDatatypeMap = {
    [SegmentFilterDataType.BOOL]: Object.values(SegmentFilterOperatorsBool),
    [SegmentFilterDataType.NUMBER]: Object.values(SegmentFilterOperatorsNumber),
    [SegmentFilterDataType.STRING]: Object.values(SegmentFilterOperatorsString),
  };

  const filterOperatorsValues =
    filter.type === FilterType.WHO
      ? filterOperatorsDatatypeMap[SegmentFilterDataType.NUMBER]
      : filterOperatorsDatatypeMap[(filter as WhereSegmentFilter).datatype];

  const filterOperatorsRef = useRef(null);
  useOnClickOutside(filterOperatorsRef, () =>
    setIsFilterOperatorsListOpen(false)
  );

  const handleSwitchFilterOperators = (value: SegmentFilterOperators) => {
    setIsFilterOperatorsListOpen(false);

    const newFilters = [...filters];
    newFilters[index].operator = value;
    updateGroupsState(newFilters);
  };

  return (
    <Box ref={filterOperatorsRef}>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        py={'2'}
        bg={'white.100'}
        cursor={'pointer'}
        onClick={() => setIsFilterOperatorsListOpen(true)}
        data-testid={'filter-operator'}
      >
        {capitalizeFirstLetter(filter.operator)}
      </Text>
      {isFilterOperatorsListOpen ? (
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
              {filterOperatorsValues.map((value) => {
                return (
                  <Flex
                    p={'3'}
                    key={value}
                    _hover={{
                      bg: 'white.100',
                    }}
                    onClick={() => handleSwitchFilterOperators(value)}
                    data-testid={'filter-operators-options'}
                    cursor={'pointer'}
                  >
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'medium'}
                    >
                      {capitalizeFirstLetter(value)}
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

export default FilterOperator;
