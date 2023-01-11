import { Flex, IconButton } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentFilterDataType,
  SegmentProperty,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import React from 'react';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import FilterOptions from '../FilterOptions';
import InputValue from '../InputValue';
import SelectEventProperty from '../SelectEventProperty';
import SelectValue from '../SelectValue';

type WhereSegmentFilterProps = {
  filter: WhereSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
};

const WhereSegmentFilter = ({
  filter,
  filters,
  updateGroupsState,
  eventProperties,
  index,
  removeFilter,
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
      />
      <FilterOperator filter={filter} />
      {[SegmentFilterDataType.STRING].includes(filter.datatype) ? (
        <SelectValue
          filter={filter}
          filters={filters}
          updateGroupsState={updateGroupsState}
          index={index}
        />
      ) : null}
      {[SegmentFilterDataType.NUMBER].includes(filter.datatype) ? (
        <InputValue
          index={index}
          filter={filter}
          filters={filters}
          updateGroupsState={updateGroupsState}
        />
      ) : null}
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

export default WhereSegmentFilter;
