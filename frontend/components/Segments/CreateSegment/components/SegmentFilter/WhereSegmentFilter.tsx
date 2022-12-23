import { Flex, IconButton } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentGroup,
  SegmentProperty,
} from '@lib/domain/segment';
import React from 'react';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import SelectEventProperty from '../SelectEventProperty';
import SelectValue from '../SelectValue';

type WhereSegmentFilterProps = {
  filter: SegmentFilter;
  filters: SegmentFilter[];
  group: SegmentGroup;
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
};

const WhereSegmentFilter = ({
  filter,
  filters,
  group,
  updateGroupsState,
  eventProperties,
  index,
  removeFilter,
}: WhereSegmentFilterProps) => {
  return (
    <Flex gap={'3'} alignItems={'center'} data-testid="query-builder">
      <FilterConditions
        index={index}
        conditions={group.conditions}
        updateGroupsState={updateGroupsState}
      />
      <SelectEventProperty
        index={index}
        filter={filter}
        eventProperties={eventProperties}
        filters={filters}
        updateGroupsState={updateGroupsState}
      />
      <FilterOperator filter={filter} />
      <SelectValue
        filter={filter}
        filters={filters}
        updateGroupsState={updateGroupsState}
        index={index}
      />
      <IconButton
        aria-label="delete"
        size={'sm'}
        icon={<i className="ri-delete-bin-6-line"></i>}
        onClick={() => removeFilter(index)}
        bg={'white.DEFAULT'}
        variant={'secondary'}
      />
    </Flex>
  );
};

export default WhereSegmentFilter;
