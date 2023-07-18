import {
  Checkbox,
  CheckboxGroup,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { TransientSheetData } from '@lib/domain/workbook';
import { getSearchResult } from '@lib/utils/common';
import { CaretLeft, MagnifyingGlass } from 'phosphor-react';
import React, { ChangeEvent, useEffect, useState } from 'react';

const generateQuery = (
  columns: string[],
  tableName: string,
  databaseName: string,
  datasourceId: string
) => {
  if (!columns.length) return '';
  const columnsQuerySubstring = columns.join(', ');
  return `Select ${columnsQuerySubstring} from ${databaseName}.${tableName} where datasource_id = '${datasourceId}'`;
};

type ConnectorColumnsProps = {
  connectorData: any;
  selectedSheetIndex: number;
  selectedColumns: string[];
  setShowColumns: Function;
  setShowEmptyState: Function;
  setSheetsData: Function;
  setSelectedColumns: Function;
};

const ConnectorColumns = ({
  connectorData,
  selectedSheetIndex,
  setShowColumns,
  setShowEmptyState,
  setSheetsData,
  selectedColumns,
  setSelectedColumns,
}: ConnectorColumnsProps) => {
  const { heirarchy, fields, database_name, table_name, datasource_id } =
    connectorData;

  const [columns, setColumns] = useState<string[]>(fields);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    const searchResults = getSearchResult(fields, searchText, { keys: [] });
    const results = searchResults.length ? searchResults : fields;

    setColumns(results);
  };

  useEffect(() => {
    const query = generateQuery(
      selectedColumns,
      table_name,
      database_name,
      datasource_id
    );

    setSheetsData((prevSheetData: TransientSheetData[]) => {
      const tempSheetsData = [...prevSheetData];
      tempSheetsData[selectedSheetIndex].query = query;
      return tempSheetsData;
    });

    setShowEmptyState(!Boolean(selectedColumns.length));
  }, [selectedColumns]);

  return (
    <Flex direction={'column'} gap={'3'}>
      <Flex alignItems={'center'} gap={'2'} px={'3'}>
        <CaretLeft
          size={16}
          onClick={() => setShowColumns(false)}
          style={{ cursor: 'pointer' }}
        />
        <Text
          fontSize={'xs-10'}
          lineHeight={'xs-10'}
          fontWeight={'500'}
          color={'grey.500'}
        >
          {heirarchy.join('/ ')}
        </Text>
      </Flex>
      <InputGroup>
        <InputLeftElement>
          <MagnifyingGlass size={12} weight="thin" />
        </InputLeftElement>
        <Input
          bg={'white.DEFAULT'}
          borderRadius={'8'}
          boxShadow={
            '0px 0px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.06), 0px 3px 3px 0px rgba(0, 0, 0, 0.05), 0px 6px 3px 0px rgba(0, 0, 0, 0.03), 0px 10px 4px 0px rgba(0, 0, 0, 0.01), 0px 16px 4px 0px rgba(0, 0, 0, 0.00)'
          }
          borderColor={'white.200'}
          placeholder="Search for column..."
          _placeholder={{
            fontSize: 'xs-12',
            lineHeight: 'xs-12',
            fontWeight: '400',
            color: 'grey.700',
          }}
          focusBorderColor="black.100"
          onChange={(e) => onChangeHandler(e)}
        />
      </InputGroup>
      <CheckboxGroup
        value={selectedColumns}
        onChange={(values: string[]) => {
          setSelectedColumns(values);
        }}
      >
        {columns.map((column) => {
          return (
            <Flex
              key={column}
              px={2}
              py={1}
              gap={3}
              alignItems={'center'}
              as={'label'}
              cursor={'pointer'}
              _hover={{
                bg: 'white.400',
              }}
              borderRadius={'4'}
            >
              <Checkbox colorScheme={'radioBlack'} value={column} />
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'500'}
                color={'grey.900'}
                maxWidth={'45'}
              >
                {column}
              </Text>
            </Flex>
          );
        })}
      </CheckboxGroup>
    </Flex>
  );
};

export default ConnectorColumns;
