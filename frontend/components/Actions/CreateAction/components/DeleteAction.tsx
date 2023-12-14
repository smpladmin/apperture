import {
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';

const DeleteAction = ({ handleDelete }: { handleDelete: Function }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button
        px={'4'}
        py={'2'}
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        colorScheme={'red'}
        variant={'solid'}
        _hover={{
          bg: 'grey.200',
        }}
        onClick={onOpen}
        data-testid={'save-button'}
      >
        Delete
      </Button>
      <Modal
        isCentered
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay backdropFilter={'blur(10px)'} bg={'grey.0'} />
        <ModalContent bg={'white.DEFAULT'}>
          <ModalHeader>Delete Action</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this action?</ModalBody>
          <ModalFooter>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              variant={'secondary'}
              mr={2}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              colorScheme="red"
              variant={'solid'}
              onClick={() => handleDelete()}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAction;
