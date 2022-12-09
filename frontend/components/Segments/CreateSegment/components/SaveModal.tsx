import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Divider,
  Flex,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

type AppsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SaveModal = ({ isOpen, onClose }: any) => {
  const [segmentName, setSegmentName] = useState('');
  const [segmentDesciption, setSegmentDescription] = useState('');
  const router = useRouter();
  const { dsId } = router.query;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        margin={'1rem'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={{ base: '16px', md: '20px' }}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={'9'}
          px={'9'}
        >
          <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
            Save User Segment
          </Text>
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
            fontSize={'0.55rem'}
          />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          mt={'7'}
          borderColor={'white.200'}
          opacity={1}
          display={{ base: 'none', md: 'block' }}
        />

        <ModalBody
          px={{ base: '4', md: '9' }}
          overflowY={'auto'}
          pt={{ base: '0', md: '9' }}
          pb={'0'}
        >
          <Text>Body</Text>
        </ModalBody>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalFooter pt={'5'} px={'9'} pb={'9'} display={'block'}>
          <Flex direction={'column'} gap={'5'}>
            <Flex alignItems={'center'} justifyContent={'space-between'}>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'400'}
                color={'grey.200'}
              >
                Created by: Anish
              </Text>
              <Text
                fontSize={'xs-14'}
                lineHeight={'xs-14'}
                fontWeight={'400'}
                color={'grey.200'}
              >
                Date: 9 Dec. 2020
              </Text>
            </Flex>
            <Button
              width={'full'}
              variant={'primary'}
              padding={'4'}
              fontSize={'base'}
              lineHeight={'base'}
              fontWeight={'600'}
              height={'auto'}
              bg={'black.100'}
              color={'white.DEFAULT'}
            >
              Save
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaveModal;
