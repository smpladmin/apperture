import { Flex, IconButton } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentFilterDataType,
  SegmentFilterOperatorsString,
  SegmentProperty,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import React from 'react';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import FilterOptions from '../FilterOptions';
import InputValue, { InputValueType } from '../InputValue';
import SelectEventProperty from '../SelectEventProperty';
import SelectValue from '../SelectValue';

type WhereSegmentFilterProps = {
  filter: WhereSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
  loadingEventProperties: boolean;
};

const WhereSegmentFilter = ({
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
      {[SegmentFilterDataType.STRING].includes(filter.datatype) ? (
        [
          SegmentFilterOperatorsString.IS,
          SegmentFilterOperatorsString.IS_NOT,
        ].includes(filter.operator as SegmentFilterOperatorsString) ? (
          <SelectValue
            filter={filter}
            filters={filters}
            updateGroupsState={updateGroupsState}
            index={index}
          />
        ) : (
          <InputValue
            index={index}
            filter={filter}
            filters={filters}
            updateGroupsState={updateGroupsState}
            type={InputValueType.TEXT}
          />
        )
      ) : null}
      {[SegmentFilterDataType.NUMBER].includes(filter.datatype) ? (
        <InputValue
          index={index}
          filter={filter}
          filters={filters}
          updateGroupsState={updateGroupsState}
          type={InputValueType.NUMBER}
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
