import {
  Button,
  Divider,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { getTransientColumns } from '@lib/services/spreadsheetService';
import { useRouter } from 'next/router';

const Spreadsheet = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [query, setQuery] = useState('Select event_name from events');
  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    onOpen();
  }, []);

  const handleGetTransientSheetData = () => {
    getTransientColumns(dsId as string, query);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
      closeOnOverlayClick={false}
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
            <Button
              py={'2'}
              px={'4'}
              bg={'black.400'}
              variant={'primary'}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              color={'white.DEFAULT'}
              onClick={handleGetTransientSheetData}
            >
              Submit
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Spreadsheet;
