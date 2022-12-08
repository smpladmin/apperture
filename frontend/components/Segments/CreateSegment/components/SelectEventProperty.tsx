import { Box, Text } from '@chakra-ui/react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

const SelectEventProperty = ({
  filter,
  eventProperties,
  filters,
  setFilters,
  index,
}: any) => {
  const [isFiltersListOpen, setOpenFiltersList] = useState(false);
  const selectFilterRef = useRef(null);

  useOnClickOutside(selectFilterRef, () => setOpenFiltersList(false));

  const onSuggestionClick = (val: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index]['operand'] = val;
    setFilters(updatedFilters);
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
      >
        {filter.operand}
      </Text>

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
          {eventProperties.map((property: any) => (
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
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default SelectEventProperty;
