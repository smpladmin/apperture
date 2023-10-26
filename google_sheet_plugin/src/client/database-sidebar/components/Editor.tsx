import { Box, Flex, IconButton, Text, Textarea } from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import ChatMessageSection from './Chat/ChatMessageSection';
import {
  ActiveCell,
  Connection,
  Message,
  MessageType,
  SheetQuery,
  Workbook,
} from '../lib/types';
import { serverFunctions } from '../../utils/serverFunctions';
import {
  computeTokenMap,
  getAllTableColumns,
  getCurrentSheetActiveCell,
  getTableColumnMap,
  getfilteredTableColumnMap,
} from '../lib/util';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-sql';

type EditorProps = {
  activeCell: ActiveCell;
  workbooks: Workbook[];
  connections: Connection[];
  isExistingQuerySelected: boolean;
  selectedSheetQuery: SheetQuery;
};

const QueryEditor = ({
  activeCell,
  workbooks,
  connections,
  isExistingQuerySelected,
  selectedSheetQuery,
}: EditorProps) => {
  const [isSql, setIsSql] = useState(false);
  const [code, setCode] = useState(selectedSheetQuery?.query || '');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isQueryEdited, setIsQueryEdited] = useState(isExistingQuerySelected);
  const [queryId, setQueryId] = useState(selectedSheetQuery?._id || '');
  const [user, setUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultRange, setResultRange] = useState({
    rows: 0,
    columns: 0,
  });

  const currentSheetActiveCell = getCurrentSheetActiveCell(
    activeCell.sheetName,
    activeCell.columnIndex,
    activeCell.rowIndex
  );

  const apiKey = useMemo(() => {
    return localStorage.getItem('apiKey') || '';
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const user = await serverFunctions.getLoggedInUserEmail();
      setUser(user);
    };
    getUser();
  }, []);

  const updateResultRange = (rows, columns) => {
    setResultRange({
      rows,
      columns,
    });
  };

  const handleSqlMessage = async () => {
    setLoading(true);
    const response = await serverFunctions.executeQuery(
      apiKey,
      code,
      isSql,
      null,
      activeCell
    );
    updateResultRange(
      response?.data?.length || 0,
      response?.headers?.length || 0
    );
    setLoading(false);
  };

  const handleNLPMessage = async () => {
    const messageType =
      prompt.toLowerCase() === 'view queries'
        ? MessageType.VIEW_QUERIES
        : MessageType.NLP_TEXT;

    setMessages((prevMsg) => [
      ...prevMsg,
      {
        sender: user,
        text: prompt,
        type: messageType,
        timestamp: new Date().toString(),
      },
    ]);
    setPrompt('');

    if (prompt.toLowerCase() !== 'view queries') {
      const tableColumnMap = getTableColumnMap(connections);
      const properties = getAllTableColumns(tableColumnMap);

      const tokenMap = computeTokenMap(prompt, properties);
      const wordReplacements = Object.keys(tokenMap).map((k) => ({
        word: k,
        replacement: tokenMap[k][0],
      }));
      const filteredColumnMap = getfilteredTableColumnMap(
        tableColumnMap,
        wordReplacements
      );

      //Temp: To make sure that NLP works with old backend which involves selecting a table
      const selectedTable = Object.keys(filteredColumnMap)?.[0];
      const tableData = {
        tableName: selectedTable || '',
        wordReplacements: wordReplacements,
        // tableColumnMap: filteredColumnMap,
      };

      setLoading(true);
      const response = await serverFunctions.executeQuery(
        apiKey,
        prompt,
        isSql,
        tableData,
        activeCell
      );
      updateResultRange(
        response?.data?.length || 0,
        response?.headers?.length || 0
      );

      setCode(response.sql);
      setLoading(false);

      const text = response?.headers?.length
        ? 'Sure, Here are your results!'
        : 'Try again! Maybe with different prompt';

      const appertureMessage = {
        sender: 'apperture',
        text,
        type: MessageType.RESPONSE_TEXT,
        timestamp: new Date().toString(),
      };

      setMessages((prevMsg) => [...prevMsg, appertureMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (isSql) {
      handleSqlMessage();
    } else {
      handleNLPMessage();
    }
  };

  useEffect(() => {
    if (!messages.length) return;

    const { sheetName, rowIndex, columnIndex } = activeCell;

    // google sheet return columnIndex and row index starting from 1
    const rangeStart = `${String.fromCharCode(
      65 + columnIndex - 1
    )}${rowIndex}`;

    // subtract 1 from columnsLength to get accurate column range
    const rangeEnd = `${String.fromCharCode(
      65 + columnIndex - 1 + resultRange.columns - 1
    )}${rowIndex + resultRange.rows}`;

    const queryName = `${sheetName} ${rangeStart}:${rangeEnd}`;

    const saveAndUpdateSheetQuery = async () => {
      if (isQueryEdited) {
        const response = await serverFunctions.updateSheetQuery(
          apiKey,
          queryId,
          queryName,
          code,
          messages,
          activeCell
        );
      } else {
        const response = await serverFunctions.saveSheetQuery(
          apiKey,
          queryName,
          code,
          messages,
          activeCell
        );
        setQueryId(response._id);
        setIsQueryEdited(true);
      }
    };
    saveAndUpdateSheetQuery();
  }, [resultRange]);

  return (
    <Box h={'100%'}>
      <Flex
        alignItems={'center'}
        px={'16px'}
        py={'8px'}
        borderBottom={'0.4px solid #DFDFDF'}
        gap={'2px'}
      >
        <i className="ph ph-squares-four" style={{ color: '#616061' }}></i>
        <Text
          fontSize={'12px'}
          fontWeight={'400'}
          lineHeight={'16px'}
          color={'#616061'}
        >
          {currentSheetActiveCell}
        </Text>
      </Flex>
      <Box py={'20px'} px={'12px'} h={'100%'}>
        <ChatMessageSection
          isSql={isSql}
          messages={messages}
          setMessages={setMessages}
          workbooks={workbooks}
          setCode={setCode}
          activeCell={activeCell}
          updateResultRange={updateResultRange}
          isLoading={loading}
          setIsLoading={setLoading}
        />
        <Box border={'0.4px solid #DFDFDF'} borderRadius={'8'} mt={'12px'}>
          <Flex
            borderRadius={'8px 8px 0px 0px'}
            alignItems={'center'}
            bg={'#F5F5F5'}
            px={'12px'}
            py={'6px'}
            borderBottom={'0.4px solid #DFDFDF'}
            gap={'2px'}
          >
            {isSql ? (
              <i className="ph-bold ph-code" style={{ color: '#EBAC42' }}></i>
            ) : (
              <i className="ph-fill ph-sparkle" style={{ color: '#EBAC42' }} />
            )}
            <Text fontSize={'10px'} fontWeight={'500'} lineHeight={'14px'}>
              {isSql ? 'SQL editor' : 'AskNLP'}
            </Text>
          </Flex>

          <Box px={'12px'} py={'12px'}>
            {isSql ? (
              <Box height={'200px'} width={'full'} overflow={'auto'}>
                <Editor
                  value={code}
                  padding={8}
                  onValueChange={(code) => {
                    console.log({ code });
                    setCode(code);
                  }}
                  highlight={(code) => highlight(code, languages.sql)}
                  style={{
                    fontSize: 12,
                    border: 0,
                    borderColor: 'transparent',
                    height: '100%',
                  }}
                />
              </Box>
            ) : (
              <Textarea
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                resize={'none'}
                border={'0'}
                borderRadius={'2px'}
                fontSize={'12px'}
                placeholder="Enter your query here..."
                _placeholder={{
                  fontSize: '12px',
                  fontWeight: '400',
                  color: '#BDBDBD',
                  lineHeight: '16px',
                }}
                focusBorderColor="#ffffff"
                px={'2px'}
                onKeyDown={(e) => {
                  e.key === 'Enter' && handleSendMessage();
                }}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            )}

            <Flex
              alignItems={'center'}
              justifyContent={'space-between'}
              mt={'2px'}
            >
              <IconButton
                onClick={() => setIsSql(!isSql)}
                background={isSql ? '#212121' : '#EDEDED'}
                aria-label="Sql Editor"
                size={'xs'}
                icon={
                  <i
                    className="ph-bold ph-code-block"
                    style={{ color: isSql ? '#ffffff' : '#606060' }}
                  ></i>
                }
                borderRadius={'2px'}
                _hover={{ background: isSql ? '#212121' : '#EDEDED' }}
              />

              <IconButton
                isLoading={loading}
                onClick={() => handleSendMessage()}
                aria-label="Submit"
                background={'#5093EC'}
                size={'xs'}
                _hover={{
                  background: 'blue.400',
                }}
                borderRadius={'2px'}
                icon={
                  <i
                    className="ph-fill ph-paper-plane-right"
                    style={{ color: '#ffffff' }}
                  ></i>
                }
              />
            </Flex>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default QueryEditor;
