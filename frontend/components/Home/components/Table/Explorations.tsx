import { Flex, Text } from '@chakra-ui/react';
import {
  SavedItems,
  SavedItemsDetails,
  WatchListItemType,
} from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import { GREY_600 } from '@theme/index';
import {
  ChartBar,
  ChartLineUp,
  ChartPie,
  DotsThreeOutlineVertical,
  Funnel,
} from 'phosphor-react';
import React from 'react';

const Explorations = ({
  info,
}: {
  info: CellContext<SavedItems, SavedItemsDetails>;
}) => {
  const { type, details } = info?.row?.original;

  const getEntityIcon = (type: WatchListItemType) => {
    const icons: { [key in WatchListItemType]: any } = {
      [WatchListItemType.WORKBOOKS]: '',
      [WatchListItemType.FUNNELS]: <Funnel color={GREY_600} size={16} />,
      [WatchListItemType.SEGMENTS]: <ChartPie color={GREY_600} size={16} />,
      [WatchListItemType.METRICS]: <ChartLineUp color={GREY_600} size={16} />,
      [WatchListItemType.ACTIONS]: '',
      [WatchListItemType.ALL]: '',
      [WatchListItemType.RETENTIONS]: <ChartBar color={GREY_600} size={16} />,
    };
    return icons[type];
  };
  return (
    <Flex gap={'3'} alignItems={'center'} minW={'25rem'}>
      {getEntityIcon(type as WatchListItemType)}
      <Text
        fontSize={'xs-14'}
        lineHeight={'lh-130'}
        fontWeight={'500'}
        color={'black'}
      >
        {details?.name}
      </Text>
    </Flex>
  );
};

export default Explorations;
