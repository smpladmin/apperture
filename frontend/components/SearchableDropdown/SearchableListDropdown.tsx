import { Box, Flex, Text } from '@chakra-ui/react';
import { Node } from '@lib/domain/node';
import { SegmentProperty } from '@lib/domain/segment';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';
import { CursorText } from 'phosphor-react';
import { CursorClick } from '@phosphor-icons/react';

type SearchableListDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: Array<string | SegmentProperty | Node>;
  onSubmit: Function;
  listKey?: keyof SegmentProperty;
  showBadge?: boolean;
  isNode?: boolean;
  dropdownPosition?: string;
  placeholderText?: string;
  width?: string;
};

const SearchableListDropdown = ({
  isOpen,
  isLoading,
  data,
  onSubmit,
  listKey,
  showBadge,
  dropdownPosition,
  isNode = false,
  placeholderText,
  width,
}: SearchableListDropdownProps) => {
  const [listData, setListData] = useState<
    Array<string | SegmentProperty | Node>
  >([]);

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
      dropdownPosition={dropdownPosition}
      placeholderText={placeholderText}
      width={width}
    >
      {listData.length ? (
        <Box data-testid={'event-property-dropdown-container'}>
          {listData.map((item) => {
            const segmentPropertyItem =
              listKey && (item as SegmentProperty)[listKey];
            return (
              <Flex
                key={listKey ? segmentPropertyItem : (item as string)}
                alignItems={'center'}
                justifyContent={'space-between'}
                _hover={{
                  bg: 'white.100',
                  cursor: 'pointer',
                }}
                data-testid={'dropdown-options'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit(item);
                }}
                borderRadius={'4'}
                py={'3'}
                px={'2'}
              >
                <Flex maxW={showBadge ? '60' : 'full'} gap={'2'}>
                  <CursorClick size={'18'} color={'#9E9E9E'} />
                  <Text
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    fontWeight={'500'}
                    wordBreak={'break-word'}
                  >
                    {listKey ? segmentPropertyItem : (item as string)}
                  </Text>
                </Flex>
                {showBadge ? (
                  <Box
                    h={'6'}
                    px={'2'}
                    py={'1'}
                    bg={'grey.DEFAULT'}
                    borderRadius={'4'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'xs-12'}
                      fontWeight={'400'}
                    >
                      {capitalizeFirstLetter((item as SegmentProperty)?.type)}
                    </Text>
                  </Box>
                ) : null}
                {isNode ? (
                  <Box
                    h={'6'}
                    p={'1'}
                    borderRadius={'4'}
                    border={'1px'}
                    borderColor={'grey.400'}
                  >
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'xs-12'}
                      fontWeight={'400'}
                    >
                      {capitalizeFirstLetter((item as Node)?.source)}
                    </Text>
                  </Box>
                ) : null}
              </Flex>
            );
          })}
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
