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
import { X } from 'phosphor-react';

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
        <ModalOverlay bg={'black.DEFAULT'} opacity={'0.3 !important'} />
        <ModalContent
          bg={'white.DEFAULT'}
          px={7}
          py={'6'}
          w={'111'}
          h={'52'}
          m={'0'}
        >
          <ModalHeader p={'0'}>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text
                fontSize={'xs-16'}
                lineHeight={'xs-16'}
                fontWeight={'500'}
                color={'grey.900'}
              >
                Create pivot table
              </Text>
              <X size={16} cursor={'pointer'} onClick={onClose} />
            </Flex>
          </ModalHeader>

          <ModalBody p={'0'}>
            <Text
              mt={'5'}
              color={'grey.600'}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'400'}
            >
              Data Range
            </Text>
            <Input
              placeholder={range}
              disabled={true}
              borderColor={'gray.400'}
              bg={'gray.100'}
              px={2}
              py={3}
              mt={2}
            />
          </ModalBody>
          <ModalFooter p={'0'} mt={5}>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              variant={'secondary'}
              mr={2}
              px={4}
              py={1.5}
              onClick={onClose}
              borderRadius={'8'}
              h={'30px'}
            >
              <Text
                fontSize={'xs-14'}
                fontWeight={'500'}
                color={'grey.900'}
                lineHeight={'130%'}
                p={'0'}
              >
                Cancel
              </Text>
            </Button>
            <Button
              h={'30px'}
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              background={'black.100'}
              px={4}
              py={1.5}
              _hover={{
                backgroundColor: 'black.400',
              }}
              onClick={handleCreate}
              borderRadius={'8'}
            >
              <Text
                fontSize={'xs-14'}
                fontWeight={'500'}
                color={'white'}
                p={'0'}
              >
                Create
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default PivotIcon;
