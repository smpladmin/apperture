import { Flex } from '@chakra-ui/react';
import { useContext } from 'react';
import ColumnResizer from './ColumnResizer';
import { Actions, GridContext } from '../context/GridContext';
import { Column } from '../types/gridTypes';

export const HeaderCell = ({
  column,
  columnIndex,
  rowIndex,
  style,
  handleResize,
}: {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  handleResize: (
    columnId: string,
    columnIndex: number,
    newWidth: number
  ) => void;
}) => {
  const { state, dispatch } = useContext(GridContext);
  const { isCommandPressed, selectedColumns } = state;
  const isHeaderSelected = selectedColumns.some(
    (selectedColumn) =>
      selectedColumn.columnId === column.columnId &&
      selectedColumn.columnIndex === columnIndex
  );

  const handleColumnSelection = (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    columnName: string
  ) => {
    if (isCommandPressed) {
      let columns = [];

      if (selectedColumns.some((column) => column.columnId === columnName)) {
        columns = selectedColumns.filter(
          (column) => column.columnId !== columnName
        );
      } else {
        columns = [...selectedColumns, { columnIndex, columnId: columnName }];
      }

      dispatch({ type: Actions.SET_SELECTED_COLUMNS, payload: columns });
    } else {
      dispatch({
        type: Actions.SET_SELECTED_COLUMNS,
        payload: [{ columnIndex, columnId: columnName }],
      });
    }
  };

  return (
    <Flex
      height={6}
      w={15}
      bg={isHeaderSelected ? 'blue.500' : 'white.500'}
      alignItems={'center'}
      justifyContent={'center'}
      borderTopWidth={'0.4px'}
      borderRightWidth={'0.4px'}
      borderBottomWidth={'0.4px'}
      borderColor={'grey.700'}
      textAlign={'center'}
      fontSize={'xs-12'}
      lineHeight={'xs-12'}
      color={isHeaderSelected ? 'white.DEFAULT' : 'grey.600'}
      fontWeight={'400'}
      style={style}
      onClick={(e) => handleColumnSelection(e, column?.columnId)}
    >
      {String.fromCharCode(65 + columnIndex)}
      {column?.resizable && (
        <ColumnResizer
          column={column}
          columnIndex={columnIndex}
          handleResize={handleResize}
        />
      )}
    </Flex>
  );
};
