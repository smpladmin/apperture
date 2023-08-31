import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
} from '@chakra-ui/react';
import { SegmentProperty } from '@lib/domain/segment';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

type SearchableCheckboxDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: Array<string | SegmentProperty>;
  onSubmit: Function;
  onSelect: Function;
  onAllSelect: Function;
  isSelectAllChecked: boolean;
  selectedValues: string[];
  dropdownPosition?: 'left' | 'right';
  listKey?: keyof SegmentProperty;
  width?: string;
  placeholderText?: string;
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
  listKey,
  width,
  placeholderText,
}: SearchableCheckboxDropdownProps) => {
  const [listData, setListData] = useState<Array<string | SegmentProperty>>([]);

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
      searchKey={listKey}
      width={width}
      placeholderText={placeholderText}
    >
      <Flex
        direction={'column'}
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
              fontWeight={'500'}
              cursor={'pointer'}
              color={'black.500'}
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
              const segmentPropertyItem =
                listKey && (value as SegmentProperty)[listKey];
              return (
                <Flex
                  as={'label'}
                  gap={'2'}
                  px={'2'}
                  py={'3'}
                  key={listKey ? segmentPropertyItem : (value as string)}
                  _hover={{
                    bg: 'white.100',
                  }}
                  data-testid={'property-value-dropdown-option'}
                  borderRadius={'4'}
                >
                  <Checkbox
                    colorScheme={'radioBlack'}
                    value={listKey ? segmentPropertyItem : (value as string)}
                  >
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'500'}
                      cursor={'pointer'}
                      color={'black.500'}
                      wordBreak={'break-word'}
                    >
                      {listKey ? segmentPropertyItem : (value as string)}
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
