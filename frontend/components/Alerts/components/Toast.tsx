import { Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import checkIcon from '@assets/icons/check-icon.svg';

const AlertToast = ({ closeToast }: { closeToast: () => void }) => {
  return (
    <Flex
      bg={'black.100'}
      alignItems={'center'}
      justifyContent={'space-between'}
      h={'10'}
      borderRadius={'25'}
      p={'3'}
    >
      <Flex alignItems={'center'} gap={'2'}>
        <Image src={checkIcon} height={'16'} width={'16'} />
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          color={'white.DEFAULT'}
          fontWeight={'normal'}
        >
          Alert Created
        </Text>
      </Flex>
      <IconButton
        aria-label="menu"
        variant={'primary'}
        icon={<i className="ri-close-line"></i>}
        color={'white.DEFAULT'}
        size={'sm'}
        bg={'black.100'}
        rounded={'full'}
        onClick={closeToast}
      />
    </Flex>
  );
};

export default AlertToast;
