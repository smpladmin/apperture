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
import Link from 'next/link';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  bodyText: string;
  primaryButtonText: string;
  secondaryButtonText?: string;
  primaryAction?: Function;
  secondaryAction?: Function;
  primaryButtonLink?: string;
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  headerText,
  bodyText,
  primaryButtonText,
  secondaryButtonText = 'Cancel',
  primaryAction,
  secondaryAction,
  primaryButtonLink,
}: ConfirmationModalProps) => {
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
          {headerText}
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
            {bodyText}
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
            onClick={() => (secondaryAction ? secondaryAction() : onClose())}
          >
            {secondaryButtonText}
          </Button>
          {primaryButtonLink ? (
            <Link href={primaryButtonLink}>
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
                {primaryButtonText}
              </Button>
            </Link>
          ) : (
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
              onClick={() => primaryAction?.()}
            >
              {primaryButtonText}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
