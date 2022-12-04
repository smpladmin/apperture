import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import EventIcon from '@assets/icons/arrow-left-up.svg';
import FunnelIcon from '@assets/icons/funnel-filter.svg';
import JourneyIcon from '@assets/icons/journey.svg';
import { WatchListItemType } from '@lib/domain/watchlist';

const getLableTypeIcon = (labelType: WatchListItemType) => {
  switch (labelType) {
    case WatchListItemType.EVENTS:
      return <Image src={EventIcon} alt={'event-arrow-up-icon'} />;
    case WatchListItemType.NOTIFICATIONS:
      return <Image src={EventIcon} alt={'notification-bell-icon'} />;
    case WatchListItemType.FUNNELS:
      return <Image src={FunnelIcon} alt={'funnel-filter-icon'} />;
    default:
      return <Image src={JourneyIcon} alt={'journey-icon'} />;
  }
};

const getLabelText = (labelType: WatchListItemType) => {
  switch (labelType) {
    case WatchListItemType.EVENTS:
      return 'Event';
    case WatchListItemType.NOTIFICATIONS:
      return 'Notification';
    case WatchListItemType.FUNNELS:
      return 'Funnel';
    default:
      return '';
  }
};

const LabelType = ({ type }: { type: WatchListItemType }) => {
  return (
    <Box bg={'white.100'} borderRadius={'100'} py={'2'} px={'2'} w={'30'}>
      <Flex gap={'1'} justifyContent={'center'}>
        {getLableTypeIcon(type)}
        <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
          {getLabelText(type)}
        </Text>
      </Flex>
    </Box>
  );
};

export default LabelType;
