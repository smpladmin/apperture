import { Flex } from '@chakra-ui/react';
import { Column } from './Grid';
import { useContext, useEffect } from 'react';
import ColumnResizer from './ColumnResizer';
import { Actions, GridContext } from './GridContext';

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
  handleResize: (columnId: string, newWidth: number) => void;
}) => {
  const { state, dispatch } = useContext(GridContext);
  const { isCommandPressed, selectedColumns } = state;

  const handleColumnSelection = (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    columnName: string
  ) => {
    if (isCommandPressed) {
      let columns = [];

      if (selectedColumns.includes(columnName)) {
        columns = selectedColumns.filter((name) => name !== columnName);
      } else {
        columns = [...selectedColumns, columnName];
      }

      dispatch({ type: Actions.SET_SELECTED_COLUMNS, payload: columns });
    } else {
      dispatch({ type: Actions.SET_SELECTED_COLUMNS, payload: [columnName] });
    }
  };

  const isHeaderSelected = selectedColumns.includes(column.columnId);

  return (
    <Flex
      height={6}
      w={15}
      bg={isHeaderSelected ? 'blue.500' : 'white.500'}
      alignItems={'center'}
      justifyContent={'center'}
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
        <ColumnResizer column={column} handleResize={handleResize} />
      )}
    </Flex>
  );
};
