import React, { useState } from 'react';
import Image from 'next/image';
import PivotTableGif from '@assets/icons/pivot-table-icon.svg';
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  Input,
} from '@chakra-ui/react';

function PivotIcon({
  addNewPivotSheet,
  range,
  enabled,
}: {
  addNewPivotSheet: () => void;
  range: string;
  enabled: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleCreate = () => {
    addNewPivotSheet();
    onClose();
  };
  return (
    <Flex
      w={'6'}
      h={'6'}
      opacity={enabled ? 1 : 0.4}
      padding={'4px'}
      borderRadius={'2px'}
      alignContent={'center'}
      justifyContent={'center'}
      backgroundColor={isHovered ? 'grey.400' : 'none'}
    >
      <Image
        src={PivotTableGif}
        alt={'pivot-table'}
        style={{ cursor: enabled ? 'pointer' : 'no-drop' }}
        onMouseEnter={() => enabled && setIsHovered(true)}
        onMouseLeave={() => enabled && setIsHovered(false)}
        onClick={() => enabled && onOpen()}
      />
      <Modal
        isCentered
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay bg={'none'} shadow={'0px 0px 7px 0px #00000033'} />
        <ModalContent px={1} py={4}>
          <ModalHeader>Create pivot table</ModalHeader>
          <ModalCloseButton />
          <ModalBody py={1}>
            <Text color={'gray.500'} fontSize={'14px'}>
              Data Range
            </Text>
            <Input
              placeholder={range}
              disabled={true}
              borderColor={'gray.400'}
              bg={'gray.100'}
              px={2}
              py={3}
              mt={3}
              mb={6}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              variant={'secondary'}
              mr={2}
              px={4}
              py={1.5}
              onClick={onClose}
              lineHeight={'130%'}
            >
              Cancel
            </Button>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              background={'black.100'}
              color={'white'}
              px={4}
              py={1.5}
              _hover={{
                backgroundColor: 'black.400',
              }}
              onClick={handleCreate}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default PivotIcon;
