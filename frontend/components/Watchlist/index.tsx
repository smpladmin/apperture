import { Box, Button, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import React, { useEffect, useState } from 'react';
import WatchListTable from './Table';
import LoadingSpinner from '@components/LoadingSpinner';
import { getSavedFunnelsForUser } from '@lib/services/funnelService';
import { WatchListItemOptions } from './util';
import WatchListItemTypeOptions from './WatchListItemOptions';

const Watchlist = () => {
  const [selectedItem, setSelectedItem] = useState(WatchListItemType.ALL);
  const [savedItemsData, setSavedItemsData] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSavedItems = async () => {
    if (selectedItem === WatchListItemType.ALL) {
      const [savedFunnels] = await Promise.all([getSavedFunnelsForUser()]);
      setSavedItemsData([...savedFunnels]);
      setIsLoading(false);
      return;
    }
    if (selectedItem === WatchListItemType.FUNNELS) {
      const savedFunnels = await getSavedFunnelsForUser();
      setSavedItemsData(savedFunnels);
      setIsLoading(false);
      return;
    }
    if (selectedItem === WatchListItemType.METRICS) {
      setSavedItemsData([]);
      setIsLoading(false);
      return;
    }
    if (selectedItem === WatchListItemType.SEGMENTS) {
      setSavedItemsData([]);
      setIsLoading(false);
      return;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getSavedItems();
  }, [selectedItem]);

  return (
    <Box px={{ base: '4', md: '30' }} py={'9'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'600'}>
          Saved
        </Text>
      </Flex>

      <Flex justifyContent={'flex-start'} mt={'6'}>
        <RadioGroup
          value={selectedItem}
          onChange={(value: WatchListItemType) => {
            setSelectedItem(value);
          }}
        >
          <Flex gap={'3'} direction={'row'}>
            {WatchListItemOptions.map((watchListItem) => {
              return (
                <WatchListItemTypeOptions
                  key={watchListItem.id}
                  watchListItem={watchListItem}
                  isSelected={watchListItem.id === selectedItem}
                />
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>

      <Box mt={'7'}>
        {isLoading ? (
          <Flex
            w={'full'}
            h={'full'}
            minH={'80'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <LoadingSpinner />
          </Flex>
        ) : (
          <WatchListTable savedItemsData={savedItemsData} />
        )}
      </Box>
    </Box>
  );
};

export default Watchlist;
