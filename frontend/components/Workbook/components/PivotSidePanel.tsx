import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Flex, Select, Text } from '@chakra-ui/react';
import { CaretLeft, Plus, X } from 'phosphor-react';
import { TransientSheetData } from '@lib/domain/workbook';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getTransientPivot } from '@lib/services/workbookService';
import { TransientPivotToSheetData } from '../util';
import { cloneDeep } from 'lodash';
import { table } from 'console';

const initialDropdownState = {
  row: false,
  column: false,
  value: false,
  filter: false,
};

export const PivotTableSidePanel = ({
  setShowColumns,
  sheet,
  setSheetsData,
  selectedSheetIndex,
}: {
  setShowColumns: Function;
  sheet: TransientSheetData;
  setSheetsData: Function;
  selectedSheetIndex: number;
}) => {
  const dsId = sheet?.meta?.dsId;
  const referenceQuery =
    sheet?.meta?.referenceSheetQuery ||
    `SELECT * FROM ${sheet?.meta?.selectedDatabase}.${sheet?.meta?.selectedTable}`;
  const [options, setOptions] = useState(sheet?.meta?.selectedOptions || []);
  const [rowDropDown, setRowDropDown] = useState(false);
  const [columnDropDown, setColumnDropDown] = useState(false);
  const [valueDropDown, setValueDropDown] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const rowBoxref = useRef(null);
  const columnBoxRef = useRef(null);
  const valueBoxref = useRef(null);
  //   const filterBoxRef = useRef(null);
  useOnClickOutside(rowBoxref, () => {
    setRowDropDown(false);
  });
  useOnClickOutside(columnBoxRef, () => {
    setColumnDropDown(false);
  });
  useOnClickOutside(valueBoxref, () => {
    setValueDropDown(false);
  });
  useEffect(() => {
    if (
      selectedRows?.length ||
      selectedColumns?.length ||
      selectedValues?.length
    ) {
      const fetchPivotData = async () => {
        const response = await getTransientPivot(
          dsId as string,
          referenceQuery,
          selectedRows,
          selectedColumns,
          selectedValues
        );
        if (
          response.data &&
          (response.data.rows || response.data.columns || response.data.data)
        ) {
          const { rows, columns, data } = response.data;
          const [headers, sheetData] = TransientPivotToSheetData(
            rows,
            selectedRows[0] || 'Rows',
            columns,
            selectedColumns[0] || 'Columns',
            data || {}
          );
          setSheetsData((prevSheetData: TransientSheetData[]) => {
            const tempSheetsData = cloneDeep(prevSheetData);
            tempSheetsData[selectedSheetIndex].headers = headers;
            tempSheetsData[selectedSheetIndex].data = sheetData;

            return tempSheetsData;
          });
        }
      };
      fetchPivotData();
    } else {
      const [headers, sheetData] = TransientPivotToSheetData();
      console.log(sheetData);
      setSheetsData((prevSheetData: TransientSheetData[]) => {
        const tempSheetsData = cloneDeep(prevSheetData);
        tempSheetsData[selectedSheetIndex].headers = headers;
        tempSheetsData[selectedSheetIndex].data = sheetData;

        return tempSheetsData;
      });
    }
  }, [selectedRows, selectedColumns, selectedValues]);

  const handleRowSubmit = (value: string) => {
    const prevValues = selectedRows;
    setSelectedRows([value]);

    setOptions((prevState) => [
      ...prevValues,
      ...prevState.filter((option) => (option != value ? true : false)),
    ]);
    setRowDropDown(false);
  };
  const handleColumnSubmit = (value: string) => {
    const prevValues = selectedColumns;

    setSelectedColumns([value]);
    setOptions((prevState) => [
      ...prevValues,
      ...prevState.filter((option) => (option != value ? true : false)),
    ]);
    setColumnDropDown(false);
  };
  const handleValueSubmit = (value: string) => {
    const prevValues = selectedValues;

    setSelectedValues([value]);
    setOptions((prevState) => [
      ...prevValues,
      ...prevState.filter((option) => (option != value ? true : false)),
    ]);
    setValueDropDown(false);
  };

  const handleCloseRowCard = (value: string) => {
    setOptions([...options, value]);
    setSelectedRows([]);
  };
  const handleCloseColumnCard = (value: string) => {
    setOptions([...options, value]);
    setSelectedColumns([]);
  };
  const handleCloseValueCard = (value: string) => {
    setOptions([...options, value]);
    setSelectedValues([]);
  };
  return (
    <Flex direction={'column'} gap={4} px={5}>
      <Flex
        fontSize={'xs-16'}
        fontWeight={500}
        lineHeight={'130%'}
        alignItems={'center'}
        gap={'2'}
      >
        Pivot table editor
        <CaretLeft
          size={16}
          onClick={() => setShowColumns(false)}
          style={{ cursor: 'pointer' }}
        />
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        Row
        <Flex ref={rowBoxref}>
          <Plus
            cursor={selectedRows?.length ? 'no-drop' : 'pointer'}
            opacity={selectedRows?.length ? 0.4 : 1}
            onClick={() => {
              !selectedRows?.length && setRowDropDown(true);
            }}
          />
          <SearchableListDropdown
            isOpen={rowDropDown}
            isLoading={false}
            data={options}
            onSubmit={handleRowSubmit}
            width={'96'}
            dropdownPosition="left"
          />
        </Flex>
      </Flex>
      {selectedRows?.length ? (
        <Flex flexDirection={'column'}>
          {selectedRows.map((row) => (
            <PivotAxisDetailCard
              key={row}
              name={row}
              onClose={handleCloseRowCard}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        Columns
        <Flex ref={columnBoxRef}>
          <Plus
            cursor={selectedColumns?.length ? 'no-drop' : 'pointer'}
            opacity={selectedColumns?.length ? 0.4 : 1}
            onClick={() => {
              !selectedColumns?.length && setColumnDropDown(true);
            }}
          />
          <SearchableListDropdown
            isOpen={columnDropDown}
            isLoading={false}
            data={options}
            onSubmit={handleColumnSubmit}
            width={'96'}
            dropdownPosition="left"
          />
        </Flex>
      </Flex>
      {selectedColumns?.length ? (
        <Flex flexDirection={'column'}>
          {selectedColumns.map((column) => (
            <PivotAxisDetailCard
              key={column}
              name={column}
              onClose={handleCloseColumnCard}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        Values
        <Flex ref={valueBoxref}>
          <Plus
            cursor={selectedValues?.length ? 'no-drop' : 'pointer'}
            opacity={selectedValues?.length ? 0.4 : 1}
            onClick={() => {
              !selectedValues?.length && setValueDropDown(true);
            }}
          />
          <SearchableListDropdown
            isOpen={valueDropDown}
            isLoading={false}
            data={options}
            onSubmit={handleValueSubmit}
            width={'96'}
            dropdownPosition="left"
          />
        </Flex>
      </Flex>
      {selectedValues?.length ? (
        <Flex flexDirection={'column'}>
          {selectedValues.map((value) => (
            <PivotValueCard
              key={value}
              name={value}
              handleClose={handleCloseValueCard}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        Filters
        <Flex>
          <Plus cursor={'no-drop'} opacity={0.4} />
        </Flex>
      </Flex>
    </Flex>
  );
};

const PivotAxisDetailCard = ({
  name,
  onClose,
}: {
  name: string;
  onClose: (name: string) => void;
}) => {
  return (
    <Flex
      flexDir={'column'}
      p={3}
      gap={'10px'}
      borderRadius={'4px'}
      bg={'white.DEFAULT'}
      border="1px solid #bdbdbd"
    >
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        {name} <X onClick={() => onClose(name)} />
      </Flex>
      <Flex gap={5}>
        <Flex
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={400}
          color={'gray.600'}
          flexDir="column"
          gap={1}
          maxWidth={`calc(50% - 10px)`}
        >
          Order
          <select
            style={{
              fontSize: 'xs-10',
              lineHeight: '135%',
              fontWeight: 400,
              paddingInline: 2,
              paddingBlock: 3,
              borderRadius: '4px',
              border: '0.4px solid #bdbdbd',
            }}
          >
            <option value="option1">Ascending</option>
            <option value="option2">Descending</option>
          </select>
        </Flex>
        <Flex
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={400}
          color={'gray.600'}
          flexDir="column"
          gap={1}
          maxWidth={`calc(50% - 10px)`}
        >
          Sort by
          <select
            style={{
              fontSize: 'xs-10',
              lineHeight: '135%',
              fontWeight: 400,
              paddingInline: 2,
              paddingBlock: 3,
              borderRadius: '4px',
              border: '0.4px solid #bdbdbd',
            }}
          >
            <option value="option1">{name}</option>
          </select>
        </Flex>
      </Flex>
      <Checkbox size={'sm'} colorScheme="black">
        <Text
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={500}
          as={'span'}
        >
          Show Total
        </Text>
      </Checkbox>
    </Flex>
  );
};

const PivotValueCard = ({
  name,
  handleClose,
}: {
  name: string;
  handleClose: (name: string) => void;
}) => {
  return (
    <Flex
      flexDir={'column'}
      p={3}
      gap={'10px'}
      borderRadius={'4px'}
      bg={'white.DEFAULT'}
      border="1px solid #bdbdbd"
    >
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
      >
        {name}{' '}
        <X
          onClick={() => {
            handleClose(name);
          }}
        />
      </Flex>
      <Flex gap={5}>
        <Flex
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={400}
          color={'gray.600'}
          flexDir="column"
          gap={1}
          maxWidth={'100%'}
        >
          Summarise by
          <select
            style={{
              fontSize: 'xs-10',
              lineHeight: '135%',
              fontWeight: 400,
              paddingInline: 2,
              paddingBlock: 3,
              borderRadius: '4px',
              border: '0.4px solid #bdbdbd',
            }}
          >
            <option value="option1">SUM</option>
          </select>
        </Flex>
      </Flex>
    </Flex>
  );
};
