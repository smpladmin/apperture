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
} from '@chakra-ui/react';
import ReactCodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useState } from 'react';
import { getTransientSpreadsheets } from '@lib/services/spreadsheetService';
import { useRouter } from 'next/router';

type QueryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  setSheetData: Function;
};

const QueryModal = ({ isOpen, onClose, setSheetData }: QueryModalProps) => {
  const [query, setQuery] = useState('Select event_name from events limit 100');
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { dsId } = router.query;

  const handleGetTransientSheetData = async () => {
    setIsSubmitButtonDisabled(true);
    const response = await getTransientSpreadsheets(dsId as string, query);

    if (response.status === 200) {
      setSheetData(response.data);
      onClose();
    } else {
      setError(response?.data?.detail);
      setIsSubmitButtonDisabled(false);
    }
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
        data-testid={'query-modal'}
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
            <ReactCodeMirror
              value={query}
              height="200px"
              extensions={[sql()]}
              onChange={(value) => {
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
              disabled={isSubmitButtonDisabled}
              data-testid={'submit-button'}
            >
              Submit
            </Button>
            {error && !isSubmitButtonDisabled ? (
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-16'}
                fontWeight={400}
                color={'red'}
                data-testid={'error-text'}
              >
                {error}
              </Text>
            ) : null}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QueryModal;
