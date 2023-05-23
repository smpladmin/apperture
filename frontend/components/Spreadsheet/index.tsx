import {
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

const Spreadsheet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState('Select event_name from events');

  useEffect(() => {
    onOpen();
  }, []);
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
          pb={'6'}
        >
          <Text fontSize={'sh-24'} lineHeight={'sh-24'} fontWeight={'600'}>
            Enter your query
          </Text>
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
          borderColor={'white.200'}
          opacity={1}
        />

        <ModalBody px={'9'} overflowY={'auto'} py={'9'}>
          <Flex direction={'column'} gap={'4'}>
            <CodeMirror
              value={query}
              height="200px"
              extensions={[sql()]}
              onChange={(value, viewUpdate) => {
                setQuery(value);
              }}
            />
            <Button>Submit</Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Spreadsheet;
