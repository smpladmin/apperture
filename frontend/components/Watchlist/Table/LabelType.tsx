import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import FunnelIcon from '@assets/icons/funnel-filter.svg';
import JourneyIcon from '@assets/icons/journey.svg';
import { WatchListItemType } from '@lib/domain/watchlist';

const getLableTypeIcon = (labelType: WatchListItemType) => {
  switch (labelType) {
    case WatchListItemType.FUNNELS:
      return <Image src={FunnelIcon} alt={'funnel-filter-icon'} />;
    case WatchListItemType.SEGMENTS:
      return <i className="ri-scissors-cut-line" />;
    case WatchListItemType.METRICS:
      return <i className="ri-funds-box-line" />;
    default:
      return <Image src={JourneyIcon} alt={'journey-icon'} />;
  }
};

const getLabelText = (labelType: WatchListItemType) => {
  switch (labelType) {
    case WatchListItemType.FUNNELS:
      return 'Funnel';
    case WatchListItemType.SEGMENTS:
      return 'Segment';
    case WatchListItemType.METRICS:
      return 'Metric';
    default:
      return '';
  }
};

const LabelType = ({ type }: { type: WatchListItemType }) => {
  return (
    <Box bg={'white.100'} borderRadius={'100'} py={'2'} px={'2'} w={'30'}>
      <Flex gap={'1'} justifyContent={'center'} alignItems={'center'}>
        {getLableTypeIcon(type)}
        <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'500'}>
          {getLabelText(type)}
        </Text>
      </Flex>
    </Box>
  );
};

export default LabelType;
