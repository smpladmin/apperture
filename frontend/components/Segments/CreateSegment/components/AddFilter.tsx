import { Box, Button, Flex } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
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
      return [...prevState, SegmentFilterConditions.AND];
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
      >
        + Filter
      </Button>
      {isFiltersListOpen ? (
        <Box
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          overflowY={'auto'}
        >
          {loadingEventProperties ? (
            <Flex
              w={'80'}
              h={'80'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            eventProperties.map((property) => (
              <Box
                key={property}
                onClick={() => onSuggestionClick(property)}
                cursor={'pointer'}
                px={'2'}
                py={'3'}
                _hover={{
                  bg: 'white.100',
                }}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
              >
                {property}
              </Box>
            ))
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default AddFilter;
