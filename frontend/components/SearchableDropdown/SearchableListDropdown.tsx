import { Box, Flex, Text } from '@chakra-ui/react';
import { SegmentProperty } from '@lib/domain/segment';
import { capitalizeFirstLetter } from '@lib/utils/common';
import React, { useEffect, useState } from 'react';
import SearchableDropdown from './SearchableDropdown';

type SearchableListDropdownProps = {
  isOpen: boolean;
  isLoading: boolean;
  data: Array<string | SegmentProperty>;
  onSubmit: Function;
  listKey?: keyof SegmentProperty;
  showBadge?: boolean;
};

const SearchableListDropdown = ({
  isOpen,
  isLoading,
  data,
  onSubmit,
  listKey,
  showBadge,
}: SearchableListDropdownProps) => {
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
      searchKey={listKey}
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
                px={'2'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSubmit(listKey ? segmentPropertyItem : item);
                }}
              >
                <Box
                  cursor={'pointer'}
                  px={'2'}
                  py={'3'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                  data-testid={'dropdown-options'}
                  maxW={'75'}
                >
                  {listKey ? segmentPropertyItem : (item as string)}
                </Box>
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
