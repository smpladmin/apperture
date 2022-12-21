import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

type SearchableListDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: any[];
  onSubmit: Function;
  listKey?: string;
};

const SearchableListDropdown = ({
  isOpen,
  isLoading,
  data,
  onSubmit,
  listKey,
}: SearchableListDropdownProps) => {
  const [listData, setListData] = useState<any[]>([]);

  useEffect(() => {
    if (!listData.length) setListData(data);
  }, [data]);

  return (
    <SearchableDropdown
      isOpen={isOpen}
      isLoading={isLoading}
      data={data}
      setSearchData={setListData}
      searchKey={listKey}
    >
      {listData.length ? (
        <Box data-testid={'event-property-dropdown-container'}>
          {listData.map((item) => (
            <Box
              key={listKey ? item[listKey] : item}
              onClick={() => onSubmit(listKey ? item[listKey] : item)}
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
              {listKey ? item[listKey] : item}
            </Box>
          ))}
        </Box>
      ) : (
        <Text
          px={'2'}
          py={'3'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'400'}
          color={'grey.100'}
        >
          {'No results found...'}
        </Text>
      )}
    </SearchableDropdown>
  );
};

export default SearchableListDropdown;
