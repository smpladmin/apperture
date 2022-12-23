import { Box, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { SegmentFilter, SegmentProperty } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type SelectEventPropertyProps = {
  filter: SegmentFilter;
  eventProperties: SegmentProperty[];
  filters: SegmentFilter[];
  updateGroupsState: Function;
  index: number;
};

const SelectEventProperty = ({
  filter,
  eventProperties,
  filters,
  updateGroupsState,
  index,
}: SelectEventPropertyProps) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState(false);
  const selectFilterRef = useRef(null);

  useOnClickOutside(selectFilterRef, () => setOpenFiltersList(false));

  const onSuggestionClick = (val: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index]['operand'] = val;
    updatedFilters[index]['values'] = [];
    updateGroupsState(updatedFilters);
    setOpenFiltersList(false);
  };

  return (
    <Box position={'relative'} ref={selectFilterRef} borderColor={'grey.100'}>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        py={'2'}
        bg={'white.100'}
        cursor={'pointer'}
        onClick={() => setOpenFiltersList(true)}
        data-testid={'event-property'}
      >
        {filter.operand}
      </Text>

      <SearchableListDropdown
        isOpen={isFiltersListOpen}
        data={eventProperties}
        isLoading={false}
        onSubmit={onSuggestionClick}
        listKey={'id'}
      />
    </Box>
  );
};

export default SelectEventProperty;
