import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

type SearchableCheckboxDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: string[];
  onSubmit: Function;
  onSelect: Function;
  onAllSelect: Function;
  isSelectAllChecked: boolean;
  selectedValues: string[];
  dropdownPosition?: string;
};

const SearchableCheckboxDropdown = ({
  isOpen,
  isLoading,
  data,
  onSubmit,
  onSelect,
  onAllSelect,
  isSelectAllChecked,
  selectedValues,
  dropdownPosition,
}: SearchableCheckboxDropdownProps) => {
  const [listData, setListData] = useState<string[]>([]);

  useEffect(() => {
    if (!listData.length) setListData(data);
  }, [data]);

  return (
    <SearchableDropdown
      isOpen={isOpen}
      isLoading={isLoading}
      data={data}
      setSearchData={setListData}
      dropdownPosition={dropdownPosition}
    >
      <Flex
        direction={'column'}
        minW={'80'}
        gap={'3'}
        data-testid={'property-values-dropdown-container'}
      >
        <Box overflowY={'auto'} maxHeight={'70'}>
          <Checkbox
            colorScheme={'radioBlack'}
            px={'2'}
            py={'3'}
            w={'full'}
            isChecked={isSelectAllChecked}
            onChange={(e) => onAllSelect(e)}
            _hover={{
              bg: 'white.100',
            }}
            data-testid={'select-all-values'}
          >
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'medium'}
              cursor={'pointer'}
            >
              {'Select all'}
            </Text>
          </Checkbox>
          <CheckboxGroup
            value={selectedValues}
            onChange={(values: string[]) => {
              onSelect(values);
            }}
          >
            {listData?.slice(0, 100).map((value) => {
              return (
                <Flex
                  as={'label'}
                  gap={'3'}
                  px={'2'}
                  py={'3'}
                  key={value}
                  _hover={{
                    bg: 'white.100',
                  }}
                  data-testid={'property-value-dropdown-option'}
                >
                  <Checkbox colorScheme={'radioBlack'} value={value}>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'medium'}
                      cursor={'pointer'}
                    >
                      {value}
                    </Text>
                  </Checkbox>
                </Flex>
              );
            })}
          </CheckboxGroup>
        </Box>
        <Button
          w="full"
          bg={'black.100'}
          color={'white.DEFAULT'}
          variant={'primary'}
          onClick={() => onSubmit()}
          data-testid={'add-event-property-values'}
        >
          Add
        </Button>
      </Flex>
    </SearchableDropdown>
  );
};

export default SearchableCheckboxDropdown;
