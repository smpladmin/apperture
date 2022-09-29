import {
  Button,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { BACKEND_BASE_URL } from 'config';
import Link from 'next/link';

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        p={{ base: '4', md: '9' }}
        margin={'1rem'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={{ base: '16px', md: '20px' }}
      >
        <ModalHeader
          p={'0'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          fontWeight={'600'}
          fontSize={{ base: 'sh-20', md: 'sh-24' }}
          lineHeight={{ base: 'sh-20', md: 'sh-24' }}
        >
          Log Out
        </ModalHeader>
        <ModalBody
          px={'0'}
          pt={{ base: '7', md: '9' }}
          pb={{ base: '6', md: '9' }}
        >
          <Text
            fontWeight={'400'}
            fontSize={{ base: 'base', md: 'sh-24' }}
            lineHeight={{ base: 'base', md: 'sh-24' }}
          >
            Are your sure you want to log out of Apperture?
          </Text>
        </ModalBody>
        <ModalFooter display={'flex'} p={'0'} gap={{ base: '2', md: '5' }}>
          <Button
            w="50%"
            borderWidth={'1px'}
            bg={'white'}
            rounded={'lg'}
            variant={'secondary'}
            p={6}
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            fontWeight={'semibold'}
            textColor={'black'}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Link href={`${BACKEND_BASE_URL}/logout`}>
            <Button
              w="50%"
              variant={'primary'}
              rounded={'lg'}
              bg={'black.100'}
              p={6}
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-14', md: 'base' }}
              fontWeight={'semibold'}
              textColor={'white.100'}
            >
              Logout
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LogoutModal;
