import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  Text,
} from '@chakra-ui/react';
import { TransientSheetData } from '@lib/domain/workbook';
import ReactCodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Eye, PencilLine, Play } from 'phosphor-react';
import React, { useState } from 'react';
import { cloneDeep } from 'lodash';

const QueryEditor = ({
  sheetsData,
  setShowSqlEditor,
  setSheetsData,
  selectedSheetIndex,
}: {
  sheetsData: TransientSheetData[];
  setShowSqlEditor: Function;
  setSheetsData: Function;
  selectedSheetIndex: number;
}) => {
  const [query, setQuery] = useState(sheetsData[selectedSheetIndex].query);

  const handleQueryChange = () => {
    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[selectedSheetIndex].query = query;
    setSheetsData(toUpdateSheets);
  };

  return (
    <Box px={'5'} pt={'4'} pb={'5'}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text>Clickhouse</Text>
        <ButtonGroup size="sm" isAttached variant="outline" borderRadius={'8'}>
          <Button>
            <Eye size={12} weight="thin" />
          </Button>
          <Button>
            <PencilLine size={12} weight="thin" />
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
      />
      <Flex gap={'4'} justifyContent={'flex-end'} alignItems={'center'}>
        <Button
          onClick={() => {
            setShowSqlEditor(false);
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
        >
          <Flex gap={'1'}>
            <Play size={16} weight="fill" />
            Run
          </Flex>
        </Button>
      </Flex>
    </Box>
  );
};

export default QueryEditor;
