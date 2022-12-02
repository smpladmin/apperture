import { Box, Button, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { WatchListItemType } from '@lib/domain/watchlist';
import React, { useEffect, useState } from 'react';
import WatchListTable from './Table';
import LoadingSpinner from '@components/LoadingSpinner';
import { getSavedNotificationsForUser } from '@lib/services/notificationService';
import { getSavedFunnelsForUser } from '@lib/services/funnelService';
import { WatchListItemOptions } from './util';
import WatchListItemTypeOptions from './WatchListItemOptions';

const Watchlist = () => {
  const [selectedItem, setSelectedItem] = useState(WatchListItemType.ALL);
  const [savedItemsData, setSavedItemsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getSavedItems = async () => {
    if (selectedItem === WatchListItemType.ALL) {
      const [savedNotifications, savedFunnels] = await Promise.all([
        getSavedNotificationsForUser(),
        getSavedFunnelsForUser(),
      ]);
      setSavedItemsData([...savedNotifications, ...savedFunnels]);
      setIsLoading(false);
      return;
    }
    if (selectedItem === WatchListItemType.NOTIFICATIONS) {
      const savedNotifications = await getSavedNotificationsForUser();
      setSavedItemsData(savedNotifications);
      setIsLoading(false);
      return;
    }
    if (selectedItem === WatchListItemType.FUNNELS) {
      const savedFunnels = await getSavedFunnelsForUser();
      setSavedItemsData(savedFunnels);
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
        <Button
          px={{ base: '4', md: '6' }}
          py={{ base: '2', md: '3' }}
          bg={'black.100'}
          variant={'primary'}
          borderRadius={'100'}
          color={'white.DEFAULT'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
        >
          {'+ Add'}
        </Button>
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
