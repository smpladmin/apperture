import { Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import checkIcon from '@assets/icons/check-icon.svg';

const AlertToast = ({
  closeToast,
  toastMessage,
}: {
  closeToast: () => void;
  toastMessage: string;
}) => {
  return (
    <Flex
      bg={'black.100'}
      alignItems={'center'}
      justifyContent={'space-between'}
      h={{ base: '10', md: '13' }}
      w={{ base: 'auto', md: '112' }}
      borderRadius={'25'}
      p={{ base: '3', md: '4' }}
    >
      <Flex alignItems={'center'} gap={'2'}>
        <Image src={checkIcon} height={'16'} width={'16'} alt={'check-icon'} />
        <Text
          fontSize={{ base: 'xs-12', md: 'xs-14' }}
          lineHeight={{ base: 'xs-12', md: 'xs-14' }}
          color={'white.DEFAULT'}
          fontWeight={'normal'}
        >
          {toastMessage}
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
