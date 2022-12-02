import { Box, Button, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { WatchlistItemType } from '@lib/domain/watchlist';
import React, { useState } from 'react';
import Table from './Table';

const Watchlist = () => {
  const [selected, setSelected] = useState(WatchlistItemType.ALL);

  return (
    <Box px={'30'} py={'9'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'600'}>
          Saved
        </Text>
        <Button
          px={'6'}
          py={'3'}
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
          value={selected}
          onChange={(value: WatchlistItemType) => {
            setSelected(value);
          }}
        >
          <Flex gap={'3'}>
            <Flex
              as={'label'}
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={
                selected === WatchlistItemType.ALL ? 'black.100' : 'white.200'
              }
              cursor={'pointer'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                All
              </Text>
              <Radio value={'all'} hidden />
            </Flex>
            <Flex
              as={'label'}
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={
                selected === WatchlistItemType.NOTIFICATIONS
                  ? 'black.100'
                  : 'white.200'
              }
              cursor={'pointer'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                Notifications
              </Text>
              <Radio value={WatchlistItemType.NOTIFICATIONS} hidden />
            </Flex>
            <Flex
              as={'label'}
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={
                selected === WatchlistItemType.FUNNELS
                  ? 'black.100'
                  : 'white.200'
              }
              cursor={'pointer'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                Funnel
              </Text>
              <Radio value={WatchlistItemType.FUNNELS} hidden />
            </Flex>
          </Flex>
        </RadioGroup>
      </Flex>

      <Box mt={'7'}>
        <Table />
      </Box>
    </Box>
  );
};

export default Watchlist;
