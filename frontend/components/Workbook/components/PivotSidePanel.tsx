import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Flex, Select, Text, useToast } from '@chakra-ui/react';
import { CaretLeft, Plus, Table, X } from 'phosphor-react';
import {
  PivotAxisDetail,
  PivotValueDetail,
  SortingOrder,
  TransientSheetData,
} from '@lib/domain/workbook';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getTransientPivot } from '@lib/services/workbookService';
import {
  TransientPivotToSheetData,
  constructPivotAxisDetailByName,
  constructPivotValueDetailByName,
} from '../util';
import { cloneDeep } from 'lodash';
import { table } from 'console';
import { ErrorResponse } from '@lib/services/util';

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
  const toast = useToast();

  const dsId = sheet?.meta?.dsId;
  const referenceQuery =
    sheet?.meta?.referenceSheetQuery ||
    `SELECT * FROM ${sheet?.meta?.selectedDatabase}.${sheet?.meta?.selectedTable}`;
  const [options, setOptions] = useState<string[]>(
    sheet?.meta?.selectedOptions || []
  );
  const [rowDropDown, setRowDropDown] = useState(false);
  const [columnDropDown, setColumnDropDown] = useState(false);
  const [valueDropDown, setValueDropDown] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PivotAxisDetail[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<PivotAxisDetail[]>([]);
  const [selectedValues, setSelectedValues] = useState<PivotValueDetail[]>([]);

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
            selectedRows[0]?.name || 'Rows',
            columns,
            selectedColumns[0]?.name || 'Columns',
            data || {}
          );
          setSheetsData((prevSheetData: TransientSheetData[]) => {
            const tempSheetsData = cloneDeep(prevSheetData);
            tempSheetsData[selectedSheetIndex].headers = headers;
            tempSheetsData[selectedSheetIndex].data = sheetData;

            return tempSheetsData;
          });
        }
        if (response.status !== 200) {
          toast({
            title:
              (response as ErrorResponse).error.detail ||
              'Something went wrong',
            status: 'error',
            variant: 'subtle',
            isClosable: true,
          });
        }
      };
      fetchPivotData();
    } else {
      const [headers, sheetData] = TransientPivotToSheetData();
      setSheetsData((prevSheetData: TransientSheetData[]) => {
        const tempSheetsData = cloneDeep(prevSheetData);
        tempSheetsData[selectedSheetIndex].headers = headers;
        tempSheetsData[selectedSheetIndex].data = sheetData;

        return tempSheetsData;
      });
    }
  }, [selectedRows, selectedColumns, selectedValues]);

  const handleRowSubmit = (value: string) => {
    const prevValues = selectedRows.map((i) => i.name);
    setSelectedRows([constructPivotAxisDetailByName(value)]);

    setOptions((prevState) => [
      ...prevValues,
      ...prevState.filter((option) => (option != value ? true : false)),
    ]);
    setRowDropDown(false);
  };
  const handleColumnSubmit = (value: string) => {
    const prevValues = selectedColumns.map((i) => i.name);

    setSelectedColumns([constructPivotAxisDetailByName(value)]);
    setOptions((prevState) => [
      ...prevValues,
      ...prevState.filter((option) => (option != value ? true : false)),
    ]);
    setColumnDropDown(false);
  };
  const handleValueSubmit = (value: string) => {
    const prevValues = selectedValues.map((i) => i.name);

    setSelectedValues([constructPivotValueDetailByName(value)]);
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
    <Flex direction={'column'} gap={4}>
      <Flex
        fontSize={'xs-16'}
        fontWeight={500}
        lineHeight={'130%'}
        alignItems={'center'}
        gap={'2'}
        borderBottom={'0.4px solid #bdbdbd'}
        px={5}
        pb={4}
      >
        <Table height={'20px'} />
        Pivot table editor
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
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
        <Flex flexDirection={'column'} px={5}>
          {selectedRows.map((row) => (
            <PivotAxisDetailCard
              key={row.name}
              name={row.name}
              onClose={handleCloseRowCard}
              setDetail={setSelectedRows}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
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
        <Flex flexDirection={'column'} px={5}>
          {selectedColumns.map((column) => (
            <PivotAxisDetailCard
              key={column.name}
              name={column.name}
              onClose={handleCloseColumnCard}
              setDetail={setSelectedColumns}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
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
        <Flex flexDirection={'column'} px={5}>
          {selectedValues.map((value) => (
            <PivotValueCard
              key={value.name}
              name={value.name}
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
        px={5}
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
  setDetail,
}: {
  name: string;
  onClose: (name: string) => void;
  setDetail: Function;
}) => {
  return (
    <Flex
      flexDir={'column'}
      p={3}
      gap={'10px'}
      borderRadius={'4px'}
      bg={'white.DEFAULT'}
      border="1px solid #bdbdbd"
      width={'full'}
    >
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-14'}
        fontWeight={500}
        lineHeight={'130%'}
        width={'full'}
      >
        <Flex maxWidth={'80%'} overflowWrap={'anywhere'}>
          {name}
        </Flex>
        <X cursor={'pointer'} onClick={() => onClose(name)} />
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
            onChange={(e) =>
              setDetail((prevState: PivotAxisDetail[]) => [
                { ...prevState[0], order_by: e.target.value },
              ])
            }
          >
            <option value={SortingOrder.ASC}>Ascending</option>
            <option value={SortingOrder.DESC}>Descending</option>
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
      <Checkbox
        size={'sm'}
        colorScheme="black"
        onChange={(e) => {
          setDetail((prevState: PivotAxisDetail[]) => [
            { ...prevState[0], show_total: e.target.checked },
          ]);
        }}
      >
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
        <Flex maxWidth={'80%'}>{name}</Flex>
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
