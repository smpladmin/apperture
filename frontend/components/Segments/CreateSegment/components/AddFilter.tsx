import { Box, Button } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { SegmentFilter, SegmentFilterConditions } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type AddFilterProps = {
  loadingEventProperties: boolean;
  eventProperties: string[];
  setFilters: Function;
  setConditions: Function;
};

const AddFilter = ({
  loadingEventProperties,
  eventProperties,
  setFilters,
  setConditions,
}: AddFilterProps) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState<boolean>(false);
  const addFilterRef = useRef(null);

  useOnClickOutside(addFilterRef, () => setOpenFiltersList(false));

  const onSuggestionClick = (val: string) => {
    setFilters((prevState: SegmentFilter[]) => [
      ...prevState,
      {
        operand: val,
        operator: 'equals',
        values: [],
      },
    ]);
    setConditions((prevState: SegmentFilterConditions[]) => {
      if (prevState.length === 0) {
        return [SegmentFilterConditions.WHERE];
      }
      if (prevState[prevState.length - 1] === SegmentFilterConditions.WHERE) {
        return [...prevState, SegmentFilterConditions.AND];
      }

      return [...prevState, prevState[prevState.length - 1]];
    });
    setOpenFiltersList(false);
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
