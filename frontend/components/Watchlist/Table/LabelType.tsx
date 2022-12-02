import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import EventIcon from '@assets/icons/arrow-left-up.svg';
import FunnelIcon from '@assets/icons/funnel-filter.svg';
import JourneyIcon from '@assets/icons/journey.svg';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { WatchListItemType } from '@lib/domain/watchlist';

const getLableTypeIcon = (labelType: string) => {
  switch (labelType) {
    case WatchListItemType.EVENTS:
      return <Image src={EventIcon} alt={'event-arrow-up-icon'} />;
    case WatchListItemType.NOTIFICATIONS:
      return <Image src={JourneyIcon} alt={'notification-bell-icon'} />;
    case WatchListItemType.FUNNELS:
      return <Image src={FunnelIcon} alt={'funnel-filter-icon'} />;
    default:
      return <Image src={EventIcon} alt={'journey-icon'} />;
  }
};

const LabelType = ({ info }: any) => {
  return (
    <Box bg={'white.100'} borderRadius={'100'} py={'2'} px={'2'} w={'30'}>
      <Flex gap={'1'} justifyContent={'center'}>
        {getLableTypeIcon(info.getValue())}
        <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
          {capitalizeFirstLetter(info.getValue())}
        </Text>
      </Flex>
    </Box>
  );
};

export default LabelType;
