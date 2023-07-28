import {
  Menu,
  Checkbox,
  CheckboxGroup,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  MenuButton,
  Text,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ConnectionSource } from '@lib/domain/connections';
import {
  SheetType,
  SubHeaderColumnType,
  TransientSheetData,
} from '@lib/domain/workbook';
import { getSearchResult } from '@lib/utils/common';
import { CaretLeft, Columns, MagnifyingGlass, Plus } from 'phosphor-react';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  dimensionSubheadersLength,
  findIndexOfFirstEmptySubheader,
  hasMetricColumnInPivotSheet,
} from '../util';
import cloneDeep from 'lodash/cloneDeep';
import { GREY_600 } from '@theme/index';

type ConnectorColumnsProps = {
  sheetsData: TransientSheetData[];
  connectorData: ConnectionSource & { heirarchy: string[] };
  selectedSheetIndex: number;
  setShowColumns: Function;
  setSheetsData: Function;
  evaluateFormulaHeader: Function;
  addDimensionColumn: Function;
};

const generateQuery = (
  columns: string[],
  tableName: string,
  databaseName: string,
  datasourceId: string
) => {
  if (!columns.length) return '';
  const columnsQuerySubstring = columns
    .map((column) => (column.includes(' ') ? '"' + column + '"' : column))
    .join(', ');
  return `Select ${columnsQuerySubstring} from ${databaseName}.${tableName} ${
    databaseName == 'default' &&
    (tableName == 'events' || tableName == 'clickstream')
      ? `where datasource_id = '${datasourceId}'`
      : ''
  }`;
};

const initializeSelectedColumns = (datasource_id: string, meta: any) => {
  return meta?.dsId === datasource_id ? meta?.selectedColumns || [] : [];
};

const ConnectorColumns = ({
  sheetsData,
  connectorData,
  selectedSheetIndex,
  setShowColumns,
  setSheetsData,
  evaluateFormulaHeader,
  addDimensionColumn,
}: ConnectorColumnsProps) => {
  const { heirarchy, fields, database_name, table_name, datasource_id } =
    connectorData;
  const sheetData = sheetsData[selectedSheetIndex];
  const [columns, setColumns] = useState<string[]>(fields);
  const [selectedColumns, setSelectedColumns] = useState(
    initializeSelectedColumns(datasource_id, sheetData?.meta)
  );
  const [dimensionColumn, setDimensionColumn] = useState({
    isAdded: false,
    column: '',
  });

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    const searchResults = getSearchResult(fields, searchText, { keys: [] });
    const results = searchResults.length ? searchResults : fields;

    setColumns(results);
  };

  useEffect(() => {
    if (sheetData?.edit_mode) return;

    const query = generateQuery(
      selectedColumns,
      table_name,
      database_name,
      datasource_id
    );

    setSheetsData((prevSheetData: TransientSheetData[]) => {
      const tempSheetsData = cloneDeep(prevSheetData);
      tempSheetsData[selectedSheetIndex].query = query;
      // TODO: should check the double bang !!
      tempSheetsData[selectedSheetIndex].meta!!.selectedColumns =
        selectedColumns;
      tempSheetsData[selectedSheetIndex].meta!!.selectedTable = table_name;
      tempSheetsData[selectedSheetIndex].meta!!.selectedDatabase =
        database_name;

      return tempSheetsData;
    });
  }, [selectedColumns]);

  const handleAddMetricOrDimensionSubheader = (
    selectedColumn: string,
    subHeaderType: SubHeaderColumnType
  ) => {
    const subHeaderName =
      subHeaderType === SubHeaderColumnType.DIMENSION
        ? `unique(${selectedColumn})`
        : 'count()';

    const headers = sheetsData[selectedSheetIndex].headers;
    const subHeaders = sheetsData[selectedSheetIndex].subHeaders;
    const firstEmptySubheaderIndex = findIndexOfFirstEmptySubheader(
      subHeaders,
      subHeaderType
    );

    if (
      firstEmptySubheaderIndex === -1 &&
      subHeaderType === SubHeaderColumnType.DIMENSION
    ) {
      // add dimensionColumn, once all empty dimensions columns are filled
      // and then evaluate the dimension
      setDimensionColumn({
        isAdded: subHeaderType === SubHeaderColumnType.DIMENSION,
        column: subHeaderName,
      });

      const lastDimensionColumnIndex =
        dimensionSubheadersLength(subHeaders) - 1;

      const columnId = headers[lastDimensionColumnIndex]?.name;
      addDimensionColumn(columnId);
      return;
    }

    if (firstEmptySubheaderIndex !== -1) {
      const columnId = String.fromCharCode(65 + firstEmptySubheaderIndex - 1);
      evaluateFormulaHeader(subHeaderName, columnId);
    }
  };

  useEffect(() => {
    // this effects triggers when sheetsData gets updated while adding a dimension column in sheet
    if (!dimensionColumn.isAdded) return;

    const subHeaders = sheetsData[selectedSheetIndex].subHeaders;
    const firstEmptySubheaderIndex = findIndexOfFirstEmptySubheader(
      subHeaders,
      SubHeaderColumnType.DIMENSION
    );
    const columnId = String.fromCharCode(65 + firstEmptySubheaderIndex - 1);

    evaluateFormulaHeader(dimensionColumn.column, columnId);
    setDimensionColumn((prevState) => ({ ...prevState, isAdded: false }));
  }, [sheetsData]);

  const isSheetInEditMode = sheetData?.edit_mode;
  const isSheetQueriedUsingAI = !sheetData?.is_sql;
  const hasMetricColumn = hasMetricColumnInPivotSheet(sheetData);

  const showViewOnlyColumns =
    isSheetInEditMode || isSheetQueriedUsingAI || hasMetricColumn;

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
          maxWidth={'50'}
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
      {showViewOnlyColumns ? (
        <ViewOnlyColumns columns={columns} />
      ) : sheetData?.sheet_type === SheetType.PIVOT_SHEET ? (
        <PivotColumns
          columns={columns}
          handleAddSubHeader={handleAddMetricOrDimensionSubheader}
        />
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
            <Columns size={16} color={GREY_600} />
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
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

const PivotColumns = ({
  columns,
  handleAddSubHeader,
}: {
  columns: string[];
  handleAddSubHeader: (
    selectedColumn: string,
    subHeaderType: SubHeaderColumnType
  ) => void;
}) => {
  return (
    <Flex direction={'column'} w={'full'}>
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
              justifyContent={'space-between'}
              alignItems={'center'}
              py={'2'}
              px={'3'}
              style={style}
            >
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.900'}
                maxWidth={'45'}
              >
                {data[index]}
              </Text>

              <Menu>
                <MenuButton
                  _active={{
                    bg: 'white.200',
                  }}
                  _hover={{ bg: 'white.200' }}
                  p={'1'}
                  bg={'transparent'}
                  borderRadius={'4'}
                >
                  <Plus size={14} weight="bold" />
                </MenuButton>
                <MenuList
                  minWidth={'30'}
                  p={'1'}
                  borderRadius={'4'}
                  zIndex={'3'}
                >
                  <MenuItem
                    onClick={() => {
                      handleAddSubHeader(
                        data[index],
                        SubHeaderColumnType.DIMENSION
                      );
                    }}
                    _focus={{
                      backgroundColor: 'white.400',
                    }}
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    fontWeight={'500'}
                    px={'2'}
                    py={'3'}
                    borderRadius={'4'}
                  >
                    Dimension
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleAddSubHeader(
                        data[index],
                        SubHeaderColumnType.METRIC
                      );
                    }}
                    _focus={{
                      backgroundColor: 'white.400',
                    }}
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    fontWeight={'500'}
                    px={'2'}
                    py={'3'}
                    borderRadius={'4'}
                  >
                    Metric
                  </MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          );
        }}
      </List>
    </Flex>
  );
};
