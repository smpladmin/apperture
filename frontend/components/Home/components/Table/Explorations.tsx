import { Flex, Text } from '@chakra-ui/react';
import {
  SavedItems,
  SavedItemsDetails,
  WatchListItemType,
} from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import { DotsThreeOutlineVertical } from 'phosphor-react';
import React from 'react';

const Explorations = ({
  info,
}: {
  info: CellContext<SavedItems, SavedItemsDetails>;
}) => {
  const { type, details } = info?.row?.original;

  const getEntityIcon = (type: WatchListItemType) => {
    const icons: { [key in WatchListItemType]: any } = {
      [WatchListItemType.WORKBOOKS]: <DotsThreeOutlineVertical />,
      [WatchListItemType.FUNNELS]: '',
      [WatchListItemType.SEGMENTS]: '',
      [WatchListItemType.METRICS]: '',
      [WatchListItemType.ACTIONS]: '',
      [WatchListItemType.ALL]: '',
      [WatchListItemType.RETENTIONS]: '',
    };
    return icons[type];
  };
  return (
    <Flex gap={'1'}>
      {getEntityIcon(type as WatchListItemType)}
      <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
        {details?.name}
      </Text>
    </Flex>
  );
};

export default Explorations;
