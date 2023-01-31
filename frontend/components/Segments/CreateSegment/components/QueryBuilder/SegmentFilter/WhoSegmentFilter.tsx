import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import {
  SegmentFilter,
  SegmentProperty,
  WhoSegmentFilter,
} from '@lib/domain/segment';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React from 'react';
import DateField from '../DateField';
import FilterConditions from '../FilterConditions';
import FilterOperator from '../FilterOperator';
import InputValue from '../InputValue';
import SelectEventProperty from '../SelectEventProperty';

type WhoSegmentFilterProps = {
  filter: WhoSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  eventProperties: SegmentProperty[];
  index: number;
  removeFilter: Function;
  loadingEventProperties: boolean;
};

const WhoSegmentFilter = ({
  filter,
  filters,
  updateGroupsState,
  eventProperties,
  index,
  removeFilter,
  loadingEventProperties,
}: WhoSegmentFilterProps) => {
  return (
    <Flex gap={'3'} alignItems={'center'}>
      <FilterConditions
        filter={filter}
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
          {'Triggered'}
        </Text>
      </Box>
      <SelectEventProperty
        index={index}
        filter={filter}
        eventProperties={eventProperties}
        filters={filters}
        updateGroupsState={updateGroupsState}
        loadingEventProperties={loadingEventProperties}
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
          {capitalizeFirstLetter(filter.aggregation)}
        </Text>
      </Box>
      <FilterOperator
        filter={filter}
        filters={filters}
        index={index}
        updateGroupsState={updateGroupsState}
      />
      <InputValue
        index={index}
        filter={filter}
        filters={filters}
        updateGroupsState={updateGroupsState}
      />
      <DateField
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

export default WhoSegmentFilter;
