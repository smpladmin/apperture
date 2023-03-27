import { Box, Button } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { getWhereAndWhoFilters } from '@components/Segments/util';
import { DateFilterType } from '@lib/domain/common';
import {
  FilterItemType,
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentFilterOperatorsNumber,
  SegmentFilterOperatorsString,
  SegmentProperty,
  SegmentFilterDataType,
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
      if (!whereFilters.length) return SegmentFilterConditions.WHERE;

      const lastWhereCondition =
        whereFilters[whereFilters.length - 1]?.condition;
      if (lastWhereCondition === SegmentFilterConditions.WHERE)
        return SegmentFilterConditions.AND;

      return lastWhereCondition;
    },
    [filters]
  );

  const getWhoFilterCondition = useCallback(
    (whoFilters: SegmentFilter[]) => {
      if (!whoFilters.length) return SegmentFilterConditions.WHO;

      const lastWhoCondition = whoFilters[whoFilters.length - 1]?.condition;
      if (lastWhoCondition === SegmentFilterConditions.WHO)
        return SegmentFilterConditions.AND;

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
        operator: SegmentFilterOperatorsString.IS,
        values: [],
        all: false,
        type: FilterType.WHERE,
        datatype: SegmentFilterDataType.STRING,
      });
    } else {
      whoFilters.push({
        condition: getWhoFilterCondition(whoFilters),
        triggered: true,
        operand: item.id,
        aggregation: 'total',
        operator: SegmentFilterOperatorsNumber.EQ,
        values: ['1'],
        date_filter: {
          days: 30,
        },
        date_filter_type: DateFilterType.LAST,
        type: FilterType.WHO,
        datatype: SegmentFilterDataType.NUMBER,
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
