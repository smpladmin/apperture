import React, { useEffect, useRef, useState } from 'react';
import { Checkbox, Flex, Select, Text, useToast } from '@chakra-ui/react';
import { CaretDown, CaretLeft, Plus, Table, X } from 'phosphor-react';
import {
  AggregateFunction,
  PivotAxisDetail,
  PivotValueDetail,
  SheetMeta,
  SortingOrder,
  TransientSheetData,
} from '@lib/domain/workbook';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getTransientPivot } from '@lib/services/workbookService';
import {
  transientPivotToSheetData,
  constructPivotAxisDetailByName,
  constructPivotValueDetailByName,
} from '../util';
import { cloneDeep } from 'lodash';
import { ErrorResponse } from '@lib/services/util';
import { trimLabel } from '@lib/utils/common';
import { BLACK_500 } from '@theme/index';

const initialDropdownState = {
  row: false,
  column: false,
  value: false,
  filter: false,
};

const getOptionsForPivot = (
  sheetsData: TransientSheetData[],
  selectedSheetIndex: number
) => {
  const {
    referenceSheetIndex,
    selectedPivotColumns,
    selectedPivotRows,
    selectedPivotValues,
  }: any = sheetsData[selectedSheetIndex]?.meta;

  const selectedValues = [
    ...(selectedPivotColumns || []),
    ...(selectedPivotRows || []),
    ...(selectedPivotValues || []),
  ].map((value) => value.name);

  const options = sheetsData[
    referenceSheetIndex
  ]?.meta?.selectedColumns?.filter(
    (option) => !selectedValues.includes(option)
  );
  return options;
};

export const PivotTableSidePanel = ({
  setShowColumns,
  setSheetsData,
  selectedSheetIndex,
  sheetsData,
}: {
  setShowColumns: Function;
  setSheetsData: Function;
  selectedSheetIndex: number;
  sheetsData: TransientSheetData[];
}) => {
  const toast = useToast();
  const sheet = sheetsData[selectedSheetIndex];
  const dsId = sheet?.meta?.dsId;
  const referenceQuery =
    sheet?.meta?.referenceSheetQuery ||
    `SELECT * FROM ${sheet?.meta?.selectedDatabase}.${sheet?.meta?.selectedTable}`;
  const [options, setOptions] = useState<string[]>(
    getOptionsForPivot(sheetsData, selectedSheetIndex) || []
  );
  const [rowDropDown, setRowDropDown] = useState(false);
  const [columnDropDown, setColumnDropDown] = useState(false);
  const [valueDropDown, setValueDropDown] = useState(false);
  const [selectedRows, setSelectedRows] = useState<PivotAxisDetail[]>(
    sheet?.meta?.selectedPivotRows || []
  );
  const [selectedColumns, setSelectedColumns] = useState<PivotAxisDetail[]>(
    sheet?.meta?.selectedPivotColumns || []
  );
  const [selectedValues, setSelectedValues] = useState<PivotValueDetail[]>(
    sheet?.meta?.selectedPivotValues || []
  );

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
          const [headers, sheetData] = transientPivotToSheetData(
            rows,
            selectedRows[0]?.name || 'Rows',
            columns,
            selectedColumns[0]?.name || 'Columns',
            data || {}
          );
          setSheetsData((prevSheetData: TransientSheetData[]) => {
            const tempSheetsData = cloneDeep(prevSheetData);
            const oldMeta = tempSheetsData[selectedSheetIndex]?.meta!!;
            tempSheetsData[selectedSheetIndex].headers = headers;
            tempSheetsData[selectedSheetIndex].data = sheetData;
            tempSheetsData[selectedSheetIndex].meta = {
              ...oldMeta,
              selectedPivotColumns: selectedColumns,
              selectedPivotRows: selectedRows,
              selectedPivotValues: selectedValues,
              selectedPivotOptions: options,
            };

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
      const [headers, sheetData] = transientPivotToSheetData();
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
        pb={3}
        mt={'-4px'}
      >
        <Table height={'20px'} />
        <Text
          fontSize={'xs-14'}
          fontWeight={'400'}
          lineHeight={'xs-14'}
          color={'grey.900'}
        >
          Pivot table editor
        </Text>
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
        color={'grey.500'}
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
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
        color={'grey.500'}
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
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
        color={'grey.500'}
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
              setDetail={setSelectedValues}
            />
          ))}
        </Flex>
      ) : null}
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        px={5}
        color={'grey.500'}
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
      border="0.4px solid #DFDFDF"
      width={'full'}
    >
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        width={'full'}
        color={'grey.900'}
      >
        <Flex maxWidth={'80%'} whiteSpace={'nowrap'}>
          {trimLabel(name, 30)}
        </Flex>
        <X cursor={'pointer'} size={12} onClick={() => onClose(name)} />
      </Flex>
      <Flex gap={5}>
        <Flex
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={400}
          color={'grey.600'}
          flexDir="column"
          gap={1}
        >
          Order
          <Select
            icon={<CaretDown fontSize={'8px'} color={BLACK_500} />}
            size={'sm'}
            fontSize="xs-10"
            lineHeight="135%"
            fontWeight={400}
            color={'grey.900'}
            borderRadius="4px"
            border="0.4px solid #bdbdbd"
            focusBorderColor={'grey.900'}
            onChange={(e) =>
              setDetail((prevState: PivotAxisDetail[]) => [
                { ...prevState[0], order_by: e.target.value },
              ])
            }
          >
            <option value={SortingOrder.ASC}>Ascending</option>
            <option value={SortingOrder.DESC}>Descending</option>
          </Select>
        </Flex>
        <Flex
          fontSize={'xs-10'}
          lineHeight={'135%'}
          fontWeight={400}
          color={'grey.600'}
          flexDir="column"
          gap={1}
          flexGrow={1}
          maxWidth={`calc(50% - 10px)`}
        >
          Sort by
          <Select
            icon={<CaretDown color={BLACK_500} fontSize={'8px'} />}
            size={'sm'}
            fontSize="xs-10"
            lineHeight="135%"
            fontWeight={400}
            color={'grey.900'}
            borderRadius="4px"
            border="0.4px solid #bdbdbd"
            focusBorderColor={'grey.900'}
          >
            <option value="option1">{name}</option>
          </Select>
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
  setDetail,
}: {
  name: string;
  handleClose: (name: string) => void;
  setDetail: Function;
}) => {
  return (
    <Flex
      flexDir={'column'}
      p={3}
      gap={'10px'}
      borderRadius={'4px'}
      bg={'white.DEFAULT'}
      border="0.4px solid #DFDFDF"
    >
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'130%'}
        color={'grey.900'}
      >
        <Flex maxWidth={'80%'}>{trimLabel(name, 25)}</Flex>
        <X
          size={12}
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
          color={'grey.600'}
          flexDir="column"
          gap={1}
          w={'full'}
        >
          Summarise by
          <Select
            icon={<CaretDown color={BLACK_500} fontSize={'8px'} />}
            size={'sm'}
            fontSize="xs-10"
            lineHeight="135%"
            fontWeight={400}
            color={'grey.900'}
            borderRadius="4px"
            border="0.4px solid #bdbdbd"
            w={'full'}
            onChange={(e) =>
              setDetail((prevState: PivotValueDetail[]) => [
                { ...prevState[0], function: e.target.value },
              ])
            }
            focusBorderColor={'grey.900'}
          >
            <option value={AggregateFunction.SUM}>SUM</option>
            <option value={AggregateFunction.COUNT}>COUNT</option>
          </Select>
        </Flex>
      </Flex>
    </Flex>
  );
};
