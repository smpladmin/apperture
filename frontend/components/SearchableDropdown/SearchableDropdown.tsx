import { Box, Flex, Input } from '@chakra-ui/react';
import { ChangeEvent, ReactNode, useEffect } from 'react';
import { getSearchResult } from '@lib/utils/common';
import LoadingSpinner from '@components/LoadingSpinner';

type SearchableDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  children: ReactNode;
  data: string[];
  setSearchData?: Function;
  dropdownPosition?: string;
  searchKey?: string;
};

const SearchableDropdown = ({
  isOpen,
  isLoading,
  children,
  data,
  setSearchData,
  dropdownPosition,
  searchKey,
}: SearchableDropdownProps) => {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      setSearchData?.(data);
      return;
    }
    const results = getSearchResult(data, e.target.value, {
      keys: searchKey ? [searchKey] : [],
    });
    setSearchData?.(results);
  };

  useEffect(() => {
    //reset list data when dropdown is open
    setSearchData?.(data);
  }, [isOpen]);

  return (
    <>
      {isOpen ? (
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
          maxH={'102'}
          overflowY={'auto'}
          right={dropdownPosition === 'right' ? 0 : ''}
        >
          {isLoading ? (
            <Flex
              w={'80'}
              h={'80'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            <Flex direction={'column'} gap={'3'}>
              <Input
                autoFocus
                type="text"
                h={'11'}
                focusBorderColor="black.100"
                onChange={handleSearch}
                placeholder="Search for events or properties..."
                _placeholder={{
                  fontSize: 'xs-14',
                  lineHeight: 'xs-14',
                  fontWeight: '400',
                  textColor: 'grey.200',
                }}
                data-testid={'dropdown-search-input'}
              />
              {children}
            </Flex>
          )}
        </Box>
      ) : null}
    </>
  );
};

export default SearchableDropdown;
