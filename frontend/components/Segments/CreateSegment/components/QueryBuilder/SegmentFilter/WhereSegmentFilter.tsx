import { Flex, IconButton } from '@chakra-ui/react';
import { SegmentFilter, SegmentProperty } from '@lib/domain/segment';
import React from 'react';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import FilterOptions from '../FilterOptions';
import SelectEventProperty from '../SelectEventProperty';
import ValueSelector from '../ValueSelector';
import { WhereFilter } from '@lib/domain/common';

type WhereSegmentFilterProps = {
  filter: WhereFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
  loadingEventProperties: boolean;
};

const WhereFilter = ({
  filter,
  filters,
  updateGroupsState,
  eventProperties,
  index,
  removeFilter,
  loadingEventProperties,
}: WhereSegmentFilterProps) => {
  return (
    <Flex gap={'3'} alignItems={'center'}>
      <FilterConditions
        filter={filter}
        filters={filters}
        updateGroupsState={updateGroupsState}
      />
      <SelectEventProperty
        index={index}
        filter={filter}
        eventProperties={eventProperties}
        filters={filters}
        updateGroupsState={updateGroupsState}
        loadingEventProperties={loadingEventProperties}
      />
      <FilterOperator
        filter={filter}
        filters={filters}
        index={index}
        updateGroupsState={updateGroupsState}
      />
      <ValueSelector
        filter={filter}
        filters={filters}
        index={index}
        updateGroupsState={updateGroupsState}
      />
      <FilterOptions
        index={index}
        filter={filter}
        filters={filters}
        updateGroupsState={updateGroupsState}
      />
      <IconButton
        aria-label="delete"
        size={'sm'}
        icon={<i className="ri-delete-bin-6-line"></i>}
        onClick={() => removeFilter(index)}
        bg={'white.DEFAULT'}
        variant={'secondary'}
        data-testid={'remove-filter'}
      />
    </Flex>
  );
};

export default WhereFilter;
