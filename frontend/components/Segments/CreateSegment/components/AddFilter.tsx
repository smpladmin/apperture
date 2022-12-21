import { Box, Button } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { SegmentFilter, SegmentFilterConditions } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type AddFilterProps = {
  loadingEventProperties: boolean;
  eventProperties: string[];
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

  const onSuggestionClick = (val: string) => {
    setOpenFiltersList(false);

    const updatedFilter = [
      ...filters,
      {
        operand: val,
        operator: 'equals',
        values: [],
      },
    ];
    if (conditions.length === 0) {
      updateGroupsState(updatedFilter, [SegmentFilterConditions.WHERE]);
      return;
    }

    let conditionToAdd;
    const isLastConditionWhere =
      conditions[conditions.length - 1] === SegmentFilterConditions.WHERE;
    if (isLastConditionWhere) {
      conditionToAdd = SegmentFilterConditions.AND;
    } else {
      // add 'and' / 'or' depending on last condition present
      conditionToAdd = conditions[conditions.length - 1];
    }
    updateGroupsState(updatedFilter, [...conditions, conditionToAdd]);
  };

  return (
    <Box position={'relative'} ref={addFilterRef} borderColor={'grey.100'}>
      <Button
        onClick={() => setOpenFiltersList(true)}
        bg={'white.DEFAULT'}
        borderRadius={'4'}
        borderColor={'red'}
        border={'1px'}
        _hover={{
          bg: 'white.100',
        }}
        data-testid={'add-filter'}
      >
        + Filter
      </Button>

      <SearchableListDropdown
        isOpen={isFiltersListOpen}
        data={eventProperties}
        isLoading={loadingEventProperties}
        onSubmit={(val: string) => onSuggestionClick(val)}
      />
    </Box>
  );
};

export default AddFilter;
