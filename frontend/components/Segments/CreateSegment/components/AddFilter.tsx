import { Box, Button } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import {
  getDateOfNDaysBack,
  getWhereAndWhoConditionsList,
} from '@components/Segments/util';
import {
  FilterItemType,
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentFilterOperators,
  SegmentProperty,
} from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type AddFilterProps = {
  loadingEventProperties: boolean;
  eventProperties: SegmentProperty[];
  updateGroupsState: Function;
  filters: SegmentFilter[];
  conditions: SegmentFilterConditions[];
};

const AddFilter = ({
  loadingEventProperties,
  eventProperties,
  updateGroupsState,
  filters,
  conditions,
}: AddFilterProps) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState<boolean>(false);
  const addFilterRef = useRef(null);

  useOnClickOutside(addFilterRef, () => setOpenFiltersList(false));

  const getFiltersList = (
    whereFilters: SegmentFilter[],
    whoFilters: SegmentFilter[],
    item: SegmentProperty
  ) => {
    if (item.type === FilterItemType.PROPERTY) {
      whereFilters.push({
        operand: item.id,
        operator: SegmentFilterOperators.EQUALS,
        values: [],
        type: FilterType.WHERE,
      });
    } else {
      whoFilters.push({
        triggered: true,
        operand: item.id,
        aggregation: 'total',
        operator: SegmentFilterOperators.EQUALS,
        values: ['1'],
        startDate: getDateOfNDaysBack(30),
        endDate: new Date(),
        type: FilterType.WHO,
      });
    }
    return [...whereFilters, ...whoFilters];
  };

  const getFilterConditionsList = (item: SegmentProperty) => {
    /* cases:-
    1. first filter - where / who depending on filter selected from dropdown
    2. by default - add 'and' condition for next filter for both where, who
    3. add 'or' condition only for where filter if last condition of where filter conditions is 'or' if item selected is property
    4. add 'or' condition only for who filter if last condition of who filter conditionsis 'or' if item selected is event
    */

    const { whereConditions, whoConditions } =
      getWhereAndWhoConditionsList(conditions);
    const lastWhereCondition = whereConditions[whereConditions.length - 1];
    const lastWhoCondition = whoConditions[whoConditions.length - 1];

    const isLastConditionWhere =
      lastWhereCondition === SegmentFilterConditions.WHERE;
    const isLastConditionWho = lastWhoCondition === SegmentFilterConditions.WHO;

    switch (item.type) {
      case FilterItemType.PROPERTY:
        if (!whereConditions.length)
          whereConditions.push(SegmentFilterConditions.WHERE);
        else if (isLastConditionWhere)
          whereConditions.push(SegmentFilterConditions.AND);
        else whereConditions.push(lastWhereCondition);
        break;
      case FilterItemType.EVENT:
        if (!whoConditions.length)
          whoConditions.push(SegmentFilterConditions.WHO);
        else if (isLastConditionWho)
          whoConditions.push(SegmentFilterConditions.AND);
        else whoConditions.push(lastWhoCondition);
    }

    return [...whereConditions, ...whoConditions];
  };

  const onAddFilter = (item: SegmentProperty) => {
    setOpenFiltersList(false);

    const whereFilters = filters.filter(
      (filter) => filter.type === FilterType.WHERE
    );
    const whoFilters = filters.filter(
      (filter) => filter.type === FilterType.WHO
    );

    const updatedFilter = getFiltersList(whereFilters, whoFilters, item);
    const updatedConditions = getFilterConditionsList(item);

    updateGroupsState(updatedFilter, updatedConditions);
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
      />
    </Box>
  );
};

export default AddFilter;
