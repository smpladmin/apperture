import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { SheetType, TransientSheetData } from '@lib/domain/workbook';
import ReactCodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Eye, PencilSimpleLine, Play } from 'phosphor-react';
import React, { useState } from 'react';
import { cloneDeep } from 'lodash';
import { ErrorResponse } from '@lib/services/util';
import { getTransientSpreadsheets } from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import { GREY_400, GREY_900, WHITE_200, WHITE_DEFAULT } from '@theme/index';
import ConfirmationModal from './ConfirmationModal';
import LoadingSpinner from '@components/LoadingSpinner';
import { getSubheaders } from '../util';

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
  const sheetData = sheetsData[selectedSheetIndex];

  const [query, setQuery] = useState(
    sheetData.is_sql ? sheetData.query : sheetData.aiQuery?.sql || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { dsId } = router.query;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleEditSelection = () => {
    setSheetsData((prevSheetData: TransientSheetData[]) => {
      const tempSheetData = cloneDeep(prevSheetData);
      tempSheetData[selectedSheetIndex].edit_mode = true;
      return tempSheetData;
    });
    onClose();
  };

  const handleQueryChange = async () => {
    setIsLoading(true);

    const response = await getTransientSpreadsheets(
      sheetsData[selectedSheetIndex]?.meta?.dsId || (dsId as string),
      query,
      true
    );
    setIsLoading(false);

    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[selectedSheetIndex].query = query;
    toUpdateSheets[selectedSheetIndex].is_sql = true;

    if (response.status === 200) {
      toUpdateSheets[selectedSheetIndex].data = response?.data?.data;
      toUpdateSheets[selectedSheetIndex].headers = response?.data?.headers;
      toUpdateSheets[selectedSheetIndex].sheet_type = SheetType.SIMPLE_SHEET;
      toUpdateSheets[selectedSheetIndex].subHeaders = getSubheaders(
        toUpdateSheets[selectedSheetIndex].sheet_type
      );
      setError('');
    } else {
      setError((response as ErrorResponse)?.error?.detail);
    }
    setSheetsData(toUpdateSheets);
  };

  return (
    <>
      <Box px={'5'} pt={'4'} pb={'5'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text>Clickhouse</Text>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              px={'3'}
              py={'2'}
              borderRadius={'8px 0px 0px 8px'}
              borderColor={!sheetData.edit_mode ? GREY_900 : GREY_400}
              bg={!sheetData.edit_mode ? WHITE_200 : WHITE_DEFAULT}
              marginInlineEnd={'0 !important'}
            >
              <Eye
                size={16}
                color={!sheetData.edit_mode ? GREY_900 : GREY_400}
                weight={!sheetData.edit_mode ? 'bold' : 'regular'}
              />
            </Button>
            <Button
              px={'3'}
              py={'2'}
              borderRadius={'0px 8px 8px 0px'}
              borderColor={sheetData.edit_mode ? GREY_900 : GREY_400}
              bg={sheetData.edit_mode ? WHITE_200 : WHITE_DEFAULT}
              onClick={() => {
                !sheetData.edit_mode && onOpen();
              }}
            >
              <PencilSimpleLine
                size={16}
                color={sheetData.edit_mode ? GREY_900 : GREY_400}
                weight={sheetData.edit_mode ? 'bold' : 'regular'}
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
          value={query}
          height="200px"
          extensions={[sql()]}
          onChange={(value) => {
            setQuery(value);
          }}
          readOnly={!sheetData.edit_mode}
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
            disabled={!sheetData.edit_mode || isLoading}
          >
            <Flex gap={'1'}>
              {isLoading ? (
                <LoadingSpinner size={'sm'} />
              ) : (
                <Play size={16} weight="fill" />
              )}
              Run
            </Flex>
          </Button>
        </Flex>
      </Box>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        headerText="Do you want to chnage the SQL query?"
        subHeaderText="Note- you will no longer be able to select columns manually."
        onSubmit={handleEditSelection}
      />
    </>
  );
};

export default QueryEditor;
