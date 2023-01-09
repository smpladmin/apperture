import { Box, Flex, Text } from '@chakra-ui/react';
import { getWhereAndWhoFilters } from '@components/Segments/util';
import {
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
} from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useCallback, useRef, useState } from 'react';

type FilterConditionsProps = {
  filter: SegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const FilterConditions = ({
  filter,
  filters,
  updateGroupsState,
}: FilterConditionsProps) => {
  const [isFilterConditionsListOpen, setIsFilterConditionsListOpen] =
    useState(false);

  const updateWhereFiltersCondition = useCallback(
    (whereFilters: SegmentFilter[], value: SegmentFilterConditions) => {
      return whereFilters.map((filter: SegmentFilter) => {
        filter.condition =
          filter.condition === SegmentFilterConditions.WHERE
            ? filter.condition
            : value;
        return filter;
      });
    },
    [filters]
  );

  const updateWhoFiltersCondition = useCallback(
    (whoFilters: SegmentFilter[], value: SegmentFilterConditions) => {
      return whoFilters.map((filter: SegmentFilter) => {
        filter.condition =
          filter.condition === SegmentFilterConditions.WHO
            ? filter.condition
            : value;
        return filter;
      });
    },
    [filters]
  );

  const handleSwitchFilterConditions = (value: SegmentFilterConditions) => {
    setIsFilterConditionsListOpen(false);
    let { whereFilters, whoFilters } = getWhereAndWhoFilters(filters);

    if (filter.type === FilterType.WHERE) {
      whereFilters = updateWhereFiltersCondition(whereFilters, value);
    } else {
      whoFilters = updateWhoFiltersCondition(whoFilters, value);
    }

    const newFilters = [...whereFilters, ...whoFilters];
    updateGroupsState(newFilters);
  };

  const filterCondtionsValues = [
    SegmentFilterConditions.AND,
    SegmentFilterConditions.OR,
  ];
  const filterConditionsRef = useRef(null);
  useOnClickOutside(filterConditionsRef, () =>
    setIsFilterConditionsListOpen(false)
  );

  const isConditionWhereOrWho = [
    SegmentFilterConditions.WHERE,
    SegmentFilterConditions.WHO,
  ].includes(filter?.condition);

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
        {filter?.condition}
      </Text>
      {isFilterConditionsListOpen && !isConditionWhereOrWho ? (
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
                    onClick={() => handleSwitchFilterConditions(value)}
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
