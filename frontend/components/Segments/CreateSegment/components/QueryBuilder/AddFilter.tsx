import { Box, Button } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { getWhereAndWhoFilters } from '@components/Segments/util';
import {
  DateFilterType,
  FilterConditions,
  FilterDataType,
  FilterOperatorsNumber,
  FilterOperatorsString,
} from '@lib/domain/common';
import {
  FilterItemType,
  FilterType,
  SegmentFilter,
  SegmentProperty,
} from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useCallback, useRef, useState } from 'react';

type AddFilterProps = {
  loadingEventProperties: boolean;
  eventProperties: SegmentProperty[];
  updateGroupsState: Function;
  filters: SegmentFilter[];
};

const AddFilter = ({
  loadingEventProperties,
  eventProperties,
  updateGroupsState,
  filters,
}: AddFilterProps) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState<boolean>(false);
  const addFilterRef = useRef(null);

  useOnClickOutside(addFilterRef, () => setOpenFiltersList(false));

  const getWhereFilterCondition = useCallback(
    (whereFilters: SegmentFilter[]) => {
      if (!whereFilters.length) return FilterConditions.WHERE;

      const lastWhereCondition =
        whereFilters[whereFilters.length - 1]?.condition;
      if (lastWhereCondition === FilterConditions.WHERE)
        return FilterConditions.AND;

      return lastWhereCondition;
    },
    [filters]
  );

  const getWhoFilterCondition = useCallback(
    (whoFilters: SegmentFilter[]) => {
      if (!whoFilters.length) return FilterConditions.WHO;

      const lastWhoCondition = whoFilters[whoFilters.length - 1]?.condition;
      if (lastWhoCondition === FilterConditions.WHO)
        return FilterConditions.AND;

      return lastWhoCondition;
    },
    [filters]
  );

  const getFiltersList = (
    whereFilters: SegmentFilter[],
    whoFilters: SegmentFilter[],
    item: SegmentProperty
  ) => {
    if (item.type === FilterItemType.PROPERTY) {
      whereFilters.push({
        condition: getWhereFilterCondition(whereFilters),
        operand: item.id,
        operator: FilterOperatorsString.IS,
        values: [],
        all: false,
        type: FilterType.WHERE,
        datatype: FilterDataType.STRING,
      });
    } else {
      whoFilters.push({
        condition: getWhoFilterCondition(whoFilters),
        triggered: true,
        operand: item.id,
        aggregation: 'total',
        operator: FilterOperatorsNumber.EQ,
        values: ['1'],
        date_filter: {
          days: 30,
        },
        date_filter_type: DateFilterType.LAST,
        type: FilterType.WHO,
        datatype: FilterDataType.NUMBER,
      });
    }
    return [...whereFilters, ...whoFilters];
  };

  const onAddFilter = (item: SegmentProperty) => {
    setOpenFiltersList(false);

    const { whereFilters, whoFilters } = getWhereAndWhoFilters(filters);
    const updatedFilter = getFiltersList(whereFilters, whoFilters, item);
    updateGroupsState(updatedFilter);
  };

  return (
    <Box position={'relative'} ref={addFilterRef} w={'fit-content'}>
      <Button
        onClick={() => setOpenFiltersList(true)}
        bg={'white.DEFAULT'}
        borderRadius={'4'}
        border={'1px'}
        borderColor={'grey.100'}
        _hover={{
          bg: 'white.100',
        }}
        data-testid={'add-filter'}
      >
        + Filter
      </Button>

      <SearchableListDropdown
        isOpen={isFiltersListOpen}
        data={eventProperties as SegmentProperty[]}
        isLoading={loadingEventProperties}
        onSubmit={onAddFilter}
        listKey={'id'}
        showBadge={true}
        width={'96'}
      />
    </Box>
  );
};

export default AddFilter;
