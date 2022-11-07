import { Box, Flex, Text } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import FunnelImage from '@assets/images/funnel.svg';
import Image from 'next/image';
import LeftAction from './LeftAction';
import RightPanel from '@components/EventsLayout/RightPanel';

const Funnel = () => {
  return (
    <Flex w={'full'} height={'full'}>
      <LeftAction />
      <RightPanel>
        <Flex
          h={'full'}
          alignItems={'center'}
          justifyContent={'center'}
          px={'6'}
          py={'6'}
        >
          <Box>
            <Image
              src={FunnelImage}
              priority={true}
              alt={'funnel-empty-state'}
            />
            <Text
              textAlign={'center'}
              mt={'10'}
              fontSize={'sh-20'}
              lineHeight={'sh-20'}
              fontWeight={'normal'}
              color={'grey.100'}
            >
              Enter events to create a funnel
            </Text>
          </Box>
        </Flex>
      </RightPanel>
    </Flex>
  );
};

export default Funnel;
