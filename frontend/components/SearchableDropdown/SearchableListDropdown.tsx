import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

type SearchableListDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: string[];
  onSubmit: Function;
};

const SearchableListDropdown = ({
  isOpen,
  isLoading,
  data,
  onSubmit,
}: SearchableListDropdownProps) => {
  const [listData, setListData] = useState<string[]>([]);

  useEffect(() => {
    if (!listData.length) setListData(data);
  }, [data]);

  useEffect(() => {
    //reset list data when dropdown is open
    setListData(data);
  }, [isOpen]);

  return (
    <SearchableDropdown
      isOpen={isOpen}
      isLoading={isLoading}
      data={data}
      setSearchData={setListData}
    >
      {listData.length ? (
        <>
          {listData.map((item) => (
            <Box
              key={item}
              onClick={() => onSubmit(item)}
              cursor={'pointer'}
              px={'2'}
              py={'3'}
              _hover={{
                bg: 'white.100',
              }}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              data-testid={'dropdown-options'}
            >
              {item}
            </Box>
          ))}
        </>
      ) : (
        <Text
          px={'2'}
          py={'3'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'400'}
          color={'grey.100'}
        >
          'No results found...'
        </Text>
      )}
    </SearchableDropdown>
  );
};

export default SearchableListDropdown;
