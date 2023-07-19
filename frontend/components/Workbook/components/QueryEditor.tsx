import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { TransientSheetData } from '@lib/domain/workbook';
import ReactCodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Eye, PencilLine, Play } from 'phosphor-react';
import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { ErrorResponse } from '@lib/services/util';
import { getTransientSpreadsheets } from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import { GREY_400, GREY_900 } from '@theme/index';
import ConfirmationModal from './ConfirmationModal';

type QueryEditorProps = {
  sheetsData: TransientSheetData[];
  setShowSqlEditor: Function;
  setSheetsData: Function;
  selectedSheetIndex: number;
};

const QueryEditor = ({
  sheetsData,
  selectedSheetIndex,
  setShowSqlEditor,
  setSheetsData,
}: QueryEditorProps) => {
  const [query, setQuery] = useState(sheetsData[selectedSheetIndex].query);
  const sheetData = sheetsData[selectedSheetIndex];
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { dsId, workbookId } = router.query;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = () => {
    setSheetsData((prevSheetData: TransientSheetData[]) => {
      const tempSheetData = [...prevSheetData];
      tempSheetData[selectedSheetIndex].editMode = true;
      return tempSheetData;
    });
    onClose();
  };

  const fetchTransientSheetData = async (query: string) => {
    setIsLoading(true);

    const response = await getTransientSpreadsheets(
      dsId as string,
      query,
      sheetData.is_sql
    );

    setIsLoading(false);

    if (response.status === 200) {
      const toUpdateSheets = cloneDeep(sheetsData);
      toUpdateSheets[selectedSheetIndex].data = response?.data?.data;
      toUpdateSheets[selectedSheetIndex].headers = response?.data?.headers;
      setSheetsData(toUpdateSheets);
      setError('');
    } else {
      setError((response as ErrorResponse)?.error?.detail);
    }
  };

  const handleQueryChange = async () => {
    await fetchTransientSheetData(query);
    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[selectedSheetIndex].query = query;
    setSheetsData(toUpdateSheets);
  };

  return (
    <>
      <Box px={'5'} pt={'4'} pb={'5'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text>Clickhouse</Text>
          <ButtonGroup
            size="sm"
            isAttached
            variant="outline"
            borderRadius={'8'}
          >
            <Button
              borderColor={!sheetData.editMode ? GREY_900 : GREY_400}
              disabled={sheetData.editMode}
            >
              <Eye
                size={12}
                color={!sheetData.editMode ? GREY_900 : GREY_400}
              />
            </Button>
            <Button
              borderColor={sheetData.editMode ? GREY_900 : GREY_400}
              onClick={() => {
                !sheetData.editMode && onOpen();
              }}
            >
              <PencilLine
                size={12}
                color={sheetData.editMode ? GREY_900 : GREY_400}
              />
            </Button>
          </ButtonGroup>
        </Flex>
        <Divider
          mt={'4'}
          mb={'3'}
          orientation="horizontal"
          borderColor={'white.400'}
          opacity={1}
        />
        <ReactCodeMirror
          value={sheetsData[selectedSheetIndex].query}
          height="200px"
          extensions={[sql()]}
          onChange={(value) => {
            setQuery(value);
          }}
          readOnly={!sheetData.editMode}
        />
        {error ? (
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
        <Flex
          gap={'4'}
          mt={'3'}
          justifyContent={'flex-end'}
          alignItems={'center'}
        >
          <Button
            onClick={() => {
              setShowSqlEditor(false);
              setError('');
            }}
            border={'0'}
            bg={'transparent'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'400'}
            py={'6px'}
            px={'4'}
            _hover={{ bg: 'white.400' }}
            borderRadius={'8'}
          >
            Close
          </Button>
          <Button
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={'blue.50'}
            pl={'3'}
            pr={'4'}
            py={'6px'}
            borderRadius={'8'}
            onClick={handleQueryChange}
            disabled={!sheetData.editMode}
          >
            <Flex gap={'1'}>
              <Play size={16} weight="fill" />
              Run
            </Flex>
          </Button>
        </Flex>
      </Box>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        headerText="Do you want to change mode?"
        subHeaderText="After entering the edit mode, you will lose all your previous data. Do you want to make permanent changes?"
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default QueryEditor;
