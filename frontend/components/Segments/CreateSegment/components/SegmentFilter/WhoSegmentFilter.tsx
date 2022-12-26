import { Box, Flex, IconButton, Input, Text } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentGroup,
  SegmentProperty,
  WhoSegmentFilter,
} from '@lib/domain/segment';
import React from 'react';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import InputValue from '../InputValue';
import SelectEventProperty from '../SelectEventProperty';

type WhoSegmentFilterProps = {
  filter: WhoSegmentFilter;
  filters: SegmentFilter[];
  group: SegmentGroup;
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
};

const WhoSegmentFilter = ({
  filter,
  filters,
  group,
  updateGroupsState,
  eventProperties,
  index,
  removeFilter,
}: WhoSegmentFilterProps) => {
  return (
    <Flex gap={'3'} alignItems={'center'} data-testid="query-builder">
      <FilterConditions
        filter={filter}
        index={index}
        conditions={group.conditions}
        updateGroupsState={updateGroupsState}
      />
      <Box>
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'600'}
          px={'2'}
          py={'2'}
          bg={'white.100'}
          cursor={'pointer'}
        >
          {'Triggered'}
        </Text>
      </Box>
      <SelectEventProperty
        index={index}
        filter={filter}
        eventProperties={eventProperties}
        filters={filters}
        updateGroupsState={updateGroupsState}
      />
      <Box>
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'600'}
          px={'2'}
          py={'2'}
          bg={'white.100'}
          cursor={'pointer'}
        >
          {filter.aggregation}
        </Text>
      </Box>
      <FilterOperator filter={filter} />
      <InputValue
        index={index}
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
      />
    </Flex>
  );
};

export default WhoSegmentFilter;
