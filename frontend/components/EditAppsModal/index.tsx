import {
  Box,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

type EditAppsModalProps = {
  isEditAppsModalOpen: boolean;
  closeEditAppsModal: () => void;
};

const EditAppsModal = ({
  isEditAppsModalOpen,
  closeEditAppsModal,
}: EditAppsModalProps) => {
  return (
    <Modal
      isOpen={isEditAppsModalOpen}
      onClose={closeEditAppsModal}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} />
      <ModalContent
        margin={'1rem'}
        rounded={'2xl'}
        maxWidth="168"
        maxHeight={{ base: 'calc(100% - 100px)', md: 'calc(100% - 200px)' }}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={10}
          px={9}
        >
          Edit Apps
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
          />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />

        <ModalBody px={9} overflowY={'auto'}></ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default EditAppsModal;
