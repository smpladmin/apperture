import { Box, Flex } from '@chakra-ui/react';
import { ChartBar, ChartPie, Percent, PlusCircle } from 'phosphor-react';
import React from 'react';
import PivotIcon from './PivotIcon';
import Image from 'next/image';
import Zero from '@assets/icons/NumberCircleZero.svg';
import DoubleZero from '@assets/icons/NumberCircleDoubleZero.svg';
import {
  ColumnFormat,
  SheetType,
  TransientSheetData,
} from '@lib/domain/workbook';
import { cloneDeep } from 'lodash';
import { SelectedColumn } from '@components/AppertureSheets/types/gridTypes';
import { calculateMaxDecimalPoints } from '../util';

const Toolbar = ({
  sheetsData,
  selectedSheetIndex,
  addNewPivotSheet,
  selectedColumns,
  setSheetsData,
  addNewChartToSheet,
}: {
  sheetsData: TransientSheetData[];
  selectedSheetIndex: number;
  addNewPivotSheet: () => void;
  selectedColumns: SelectedColumn[];
  setSheetsData: React.Dispatch<React.SetStateAction<TransientSheetData[]>>;
  addNewChartToSheet: () => void;
}) => {
  const sheet = sheetsData[selectedSheetIndex];

  const isPivotTable =
    sheetsData[selectedSheetIndex].sheet_type === SheetType.PIVOT_TABLE;

  const handleColumnValueToPercentConversion = () => {
    setSheetsData((prevSheet: TransientSheetData[]) => {
      const sheetsCopy = cloneDeep(prevSheet);

      const columnFormat = sheetsCopy[selectedSheetIndex]?.columnFormat;

      const selectedColumnFormat: ColumnFormat = {};

      selectedColumns.forEach((column) => {
        const selectedColumnIndex = column.columnIndex;
        selectedColumnFormat[selectedColumnIndex.toString()] = {
          ...columnFormat?.[selectedColumnIndex],
          format: { percent: true, decimal: 2 },
        };
      });

      sheetsCopy[selectedSheetIndex].columnFormat = {
        ...columnFormat,
        ...selectedColumnFormat,
      };
      return sheetsCopy;
    });
  };

  const handleIncreaseDecimalPlacesInColumnValue = () => {
    setSheetsData((prevSheet: TransientSheetData[]) => {
      const sheetsCopy = cloneDeep(prevSheet);
      const sheetData = sheetsCopy[selectedSheetIndex].data;

      const columnFormat = sheetsCopy[selectedSheetIndex]?.columnFormat;

      const selectedColumnFormat: ColumnFormat = {};

      selectedColumns.forEach((column) => {
        const { columnIndex, columnId } = column;
        const columnIndexFormat = columnFormat?.[columnIndex]?.format;

        // initialize decimal count with max decimal count in existing data for column
        const columnData = sheetData.map((sd) => sd[columnId]);
        const maxDecimalPlaces = calculateMaxDecimalPoints(columnData);

        selectedColumnFormat[columnIndex.toString()] = {
          ...columnFormat?.[columnIndex],
          format: {
            percent: columnIndexFormat?.percent || false,
            decimal: Math.min(
              20,
              (columnIndexFormat?.decimal ?? maxDecimalPlaces) + 1
            ),
          },
        };
      });

      sheetsCopy[selectedSheetIndex].columnFormat = {
        ...columnFormat,
        ...selectedColumnFormat,
      };

      return sheetsCopy;
    });
  };

  const handleDecreaseDecimalPlacesInColumnValue = () => {
    setSheetsData((prevSheet: TransientSheetData[]) => {
      const sheetsCopy = cloneDeep(prevSheet);
      const sheetData = sheetsCopy[selectedSheetIndex].data;

      const columnFormat = sheetsCopy[selectedSheetIndex]?.columnFormat;
      const selectedColumnFormat: ColumnFormat = {};

      selectedColumns.forEach((column) => {
        const { columnIndex, columnId } = column;
        const columnIndexFormat = columnFormat?.[columnIndex]?.format;

        // initialize decimal count with max decimal count in existing data for column
        const columnData = sheetData.map((sd) => sd[columnId]);
        const maxDecimalPlaces = calculateMaxDecimalPoints(columnData);

        selectedColumnFormat[columnIndex.toString()] = {
          ...columnFormat?.[columnIndex],
          format: {
            percent: columnIndexFormat?.percent || false,
            decimal: Math.max(
              0,
              (columnIndexFormat?.decimal ?? maxDecimalPlaces) - 1
            ),
          },
        };
      });

      sheetsCopy[selectedSheetIndex].columnFormat = {
        ...columnFormat,
        ...selectedColumnFormat,
      };
      return sheetsCopy;
    });
  };

  return (
    <Flex
      background={'white.500'}
      px={5}
      py={2}
      borderBottomWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      <Flex
        borderRadius={'14px'}
        alignItems={'center'}
        gap={'3'}
        px={'3'}
        py={'6px'}
        backgroundColor={'white.200'}
        w={'full'}
      >
        <Flex
          w={'6'}
          h={'6'}
          borderRadius={'4'}
          _hover={{
            backgroundColor: 'grey.400',
            cursor: isPivotTable ? 'not-allowed' : 'pointer',
          }}
          opacity={isPivotTable ? '0.4' : 1}
          justifyContent={'center'}
          alignItems={'center'}
          onClick={() => !isPivotTable && addNewChartToSheet()}
        >
          <ChartBar
            style={{
              margin: '6px',
            }}
          />
        </Flex>

        <PivotIcon
          addNewPivotSheet={addNewPivotSheet}
          range={sheet?.name || ''}
          enabled={
            sheetsData[selectedSheetIndex].sheet_type !== SheetType.PIVOT_TABLE
          }
        />
        <Flex
          w={'6'}
          h={'6'}
          borderRadius={'4'}
          _hover={{ backgroundColor: 'grey.400', cursor: 'pointer' }}
          justifyContent={'center'}
          alignItems={'center'}
          onClick={handleColumnValueToPercentConversion}
        >
          <Percent />
        </Flex>
        <Box
          w={'6'}
          h={'6'}
          borderRadius={'4'}
          _hover={{ backgroundColor: 'grey.400', cursor: 'pointer' }}
          onClick={handleDecreaseDecimalPlacesInColumnValue}
        >
          <Image src={Zero} alt={'Zero'} />
        </Box>
        <Box
          w={'7'}
          h={'6'}
          pr={'1'}
          borderRadius={'4'}
          _hover={{ backgroundColor: 'grey.400', cursor: 'pointer' }}
          onClick={handleIncreaseDecimalPlacesInColumnValue}
        >
          <Image src={DoubleZero} alt={'Double Zero'} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Toolbar;
