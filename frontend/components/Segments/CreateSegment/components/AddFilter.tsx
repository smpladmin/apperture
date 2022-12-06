import { Box, Button } from '@chakra-ui/react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

const AddFilter = ({ setFilters, setFilterOperators }: any) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState(false);
  const addFilterRef = useRef(null);

  useOnClickOutside(addFilterRef, () => setOpenFiltersList(false));

  //   const onSuggestionClick = (val: string) => {
  //     setFilters((prevState: any) => [
  //       ...prevState,
  //       {
  //         operand: val,
  //         operator: 'Equals',
  //         value: '',
  //       },
  //     ]);
  //     setFilterOperators((prevState: any) => {
  //       if (prevState.length === 0) {
  //         return ['where'];
  //       }
  //       return [...prevState, 'and'];
  //     });
  //     setOpenFiltersList(false);
  //   };

  return (
    <Box position={'relative'} ref={addFilterRef}>
      <Button
        onClick={() => setOpenFiltersList(true)}
        bg={'white.DEFAULT'}
        borderRadius={'4'}
        borderColor={'grey.200'}
        border={'1px'}
      >
        + Filter
      </Button>
      {isFiltersListOpen ? (
        <Box
          position={'absolute'}
          zIndex={99}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          overflowY={'auto'}
        ></Box>
      ) : null}
    </Box>
  );
};

export default AddFilter;
