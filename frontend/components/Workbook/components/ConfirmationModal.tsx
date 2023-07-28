import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerText: string;
  subHeaderText: string;
  onSubmit: Function;
};

const ConfirmationModal = ({
  isOpen,
  onClose,
  headerText,
  subHeaderText,
  onSubmit,
}: ConfirmationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'md'}
      trapFocus={false}
    >
      <ModalOverlay opacity={'0.3 !important'} bg={'black.DEFAULT'} />
      <ModalContent
        margin={'1rem'}
        maxWidth="120"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={'12'}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          px={'8'}
          pt={'8'}
          pb={'0'}
        >
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
            {headerText}
          </Text>
        </ModalHeader>

        <ModalBody px={'8'} pt={'2'} pb={'8'} overflowY={'auto'}>
          <Flex direction={'column'} gap={'6'}>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'400'}
              color={'black.500'}
              width={'full'}
            >
              {subHeaderText}
            </Text>

            <Flex gap={'3'} justifyContent={'flex-end'}>
              <Button
                width={'max-content'}
                variant={'secondary'}
                px={'4'}
                py={'6px'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
                color={'black.100'}
                border={'1px solid black'}
                borderRadius={'8'}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                width={'max-content'}
                variant={'primary'}
                px={'4'}
                py={'6px'}
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'500'}
                bg={'black.100'}
                color={'white.DEFAULT'}
                borderRadius={'8'}
                onClick={() => onSubmit()}
              >
                Confirm
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
