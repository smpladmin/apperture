import { Box, Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { getWhereAndWhoFilters } from '@components/Segments/util';
import { FilterConditions } from '@lib/domain/common';
import { FilterType, SegmentFilter } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useCallback, useRef, useState } from 'react';

type FilterConditionsProps = {
  filter: SegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
};

const FilterCondition = ({
  filter,
  filters,
  updateGroupsState,
}: FilterConditionsProps) => {
  const [isFilterConditionsListOpen, setIsFilterConditionsListOpen] =
    useState(false);

  const updateWhereFiltersCondition = useCallback(
    (whereFilters: SegmentFilter[], value: FilterConditions) => {
      return whereFilters.map((filter: SegmentFilter) => {
        filter.condition =
          filter.condition === FilterConditions.WHERE
            ? filter.condition
            : value;
        return filter;
      });
    },
    [filters]
  );

  const updateWhoFiltersCondition = useCallback(
    (whoFilters: SegmentFilter[], value: FilterConditions) => {
      return whoFilters.map((filter: SegmentFilter) => {
        filter.condition =
          filter.condition === FilterConditions.WHO ? filter.condition : value;
        return filter;
      });
    },
    [filters]
  );

  const handleSwitchFilterConditions = (value: FilterConditions) => {
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

  const filterCondtionsValues = [FilterConditions.AND, FilterConditions.OR];
  const filterConditionsRef = useRef(null);
  useOnClickOutside(filterConditionsRef, () =>
    setIsFilterConditionsListOpen(false)
  );

  const isConditionWhereOrWho = [
    FilterConditions.WHERE,
    FilterConditions.WHO,
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
      <Dropdown isOpen={isFilterConditionsListOpen && !isConditionWhereOrWho}>
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
      </Dropdown>
    </Box>
  );
};

export default FilterCondition;
