import { Box, Button, Flex, Icon, Image, Text } from '@chakra-ui/react';
import funnelIcon from '@assets/icons/funnel-icon.svg';
import notificationBellIcon from '@assets/icons/notification-bell.svg';
import 'remixicon/fonts/remixicon.css';

const EventDetailFloater = () => {
  return (
    <Box
      p={'4'}
      bg={'white.DEFAULT'}
      shadow={'4px 4px 12px rgba(0, 0, 0, 0.12)'}
      rounded={'xl'}
      border={'1px'}
      borderColor={'white.200'}
    >
      <Text fontSize={'sh-18'} lineHeight={'sh-18'} fontWeight={'medium'}>
        App Launched
      </Text>
      <Text
        fontSize={'xs-14'}
        lineHeight={'base'}
        fontWeight={'normal'}
        color={'grey.200'}
        mt={'3'}
      >
        13.6% of overall app traffic on this event
      </Text>
      <Flex alignItems={'baseline'} gap={'1'}>
        <Text fontSize={'xs-14'} fontWeight={'medium'} lineHeight={'base'}>
          6293 M
        </Text>
        <Text fontSize={'xs-12'} fontWeight={'medium'} lineHeight={'xs-12'}>
          Hits
        </Text>
      </Flex>
      <Flex gap={'2'} h={'10'} mt={'5'} w={'full'}>
        <Button bg={'black.100'} borderRadius={'25'}>
          <Flex gap={'2'} alignItems={'center'} justifyContent={'center'}>
            <Image src={notificationBellIcon.src} alt={'notification-bell'} />
            <Text
              color={'white.DEFAULT'}
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'medium'}
            >
              {'Set Update'}
            </Text>
          </Flex>
        </Button>
        <Button bg={'white.200'} borderRadius={'25'}>
          <Flex gap={'2'} alignItems={'center'} justifyContent={'center'}>
            <Image src={funnelIcon.src} alt={'funnel-icon'} />
            <Text
              color={'black.100'}
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'medium'}
            >
              {'Measure Conversion'}
            </Text>
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

export default EventDetailFloater;
