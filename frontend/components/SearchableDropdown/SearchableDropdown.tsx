import { Flex, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { ChangeEvent, ReactNode, useEffect } from 'react';
import { getSearchResult } from '@lib/utils/common';
import LoadingSpinner from '@components/LoadingSpinner';
import { SegmentProperty, SegmentWithUser } from '@lib/domain/segment';
import Dropdown from './Dropdown';
import { Node } from '@lib/domain/node';
import { MagnifyingGlass } from 'phosphor-react';

type SearchableDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  children: ReactNode;
  data: Array<string | SegmentProperty | Node | SegmentWithUser>;
  setSearchData?: Function;
  dropdownPosition?: string;
  searchKey?: string;
  placeholderText?: string;
  width?: string;
};

const SearchableDropdown = ({
  isOpen,
  isLoading,
  children,
  data,
  setSearchData,
  dropdownPosition,
  searchKey,
  placeholderText = 'Search event or properties...',
  width,
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
    <Dropdown isOpen={isOpen} dropdownPosition={dropdownPosition} width={width}>
      {isLoading ? (
        <Flex
          w={width || '76'}
          h={'80'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <LoadingSpinner />
        </Flex>
      ) : (
        <Flex direction={'column'} gap={'3'}>
          <InputGroup>
            <InputLeftElement>
              <MagnifyingGlass size={'18'} />
            </InputLeftElement>
            <Input
              autoFocus
              type="text"
              h={'10'}
              focusBorderColor="black.100"
              onChange={handleSearch}
              placeholder={placeholderText}
              _placeholder={{
                fontSize: 'xs-14',
                lineHeight: 'lh-135',
                fontWeight: '400',
                textColor: 'grey.600',
              }}
              data-testid={'dropdown-search-input'}
              bg={'white.DEFAULT'}
            />
          </InputGroup>
          {children}
        </Flex>
      )}
    </Dropdown>
  );
};

export default SearchableDropdown;
