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
import { CaretLeft, Columns, MagnifyingGlass } from 'phosphor-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

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
  sheetsData: TransientSheetData[];
  connectorData: any;
  selectedSheetIndex: number;
  setShowColumns: Function;
  setShowEmptyState: Function;
  setSheetsData: Function;
};

const initializeSelectedColumns = (datasource_id: string, meta: any) => {
  return meta?.dsId === datasource_id ? meta?.selectedColumns || [] : [];
};

const ConnectorColumns = ({
  sheetsData,
  connectorData,
  selectedSheetIndex,
  setShowColumns,
  setShowEmptyState,
  setSheetsData,
}: ConnectorColumnsProps) => {
  const { heirarchy, fields, database_name, table_name, datasource_id } =
    connectorData;
  const sheetData = sheetsData[selectedSheetIndex];
  const [columns, setColumns] = useState<string[]>(fields);
  const [selectedColumns, setSelectedColumns] = useState(
    initializeSelectedColumns(datasource_id, sheetData?.meta)
  );

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    const searchResults = getSearchResult(fields, searchText, { keys: [] });
    const results = searchResults.length ? searchResults : fields;

    setColumns(results);
  };

  useEffect(() => {
    setShowEmptyState((prevState: boolean) => {
      return sheetData.editMode ? prevState : !Boolean(selectedColumns.length);
    });

    if (sheetData.editMode) return;
    const query = generateQuery(
      selectedColumns,
      table_name,
      database_name,
      datasource_id
    );

    setSheetsData((prevSheetData: TransientSheetData[]) => {
      const tempSheetsData = [...prevSheetData];
      tempSheetsData[selectedSheetIndex].query = query;
      tempSheetsData[selectedSheetIndex].meta.selectedColumns = selectedColumns;
      return tempSheetsData;
    });
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
      {sheetData?.editMode ? (
        <ViewOnlyColumns columns={columns} />
      ) : (
        <CheckColumns
          columns={columns}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
        />
      )}
    </Flex>
  );
};

export default ConnectorColumns;

const CheckColumns = ({
  columns,
  selectedColumns,
  setSelectedColumns,
}: {
  selectedColumns: string[];
  columns: string[];
  setSelectedColumns: Function;
}) => {
  return (
    <CheckboxGroup
      value={selectedColumns}
      onChange={(values: string[]) => {
        setSelectedColumns(values);
      }}
    >
      <List
        itemData={columns}
        innerElementType="div"
        itemCount={columns.length}
        itemSize={40}
        height={1000}
        width={240}
      >
        {({ data, index, style }) => {
          return (
            <Flex
              key={index}
              style={style}
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
              <Checkbox colorScheme={'radioBlack'} value={data[index]} />
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'500'}
                color={'grey.900'}
                maxWidth={'45'}
              >
                {data[index]}
              </Text>
            </Flex>
          );
        }}
      </List>
    </CheckboxGroup>
  );
};

const ViewOnlyColumns = ({ columns }: { columns: string[] }) => {
  return (
    <Flex direction={'column'}>
      {columns.map((column) => {
        return (
          <Flex
            key={column}
            px={'3'}
            py={'2'}
            gap={3}
            alignItems={'center'}
            cursor={'pointer'}
            _hover={{
              bg: 'white.400',
            }}
            borderRadius={'4'}
          >
            <Columns size={16} />
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
    </Flex>
  );
};
