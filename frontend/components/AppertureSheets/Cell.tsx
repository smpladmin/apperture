import { Flex } from '@chakra-ui/react';
import { Column } from './grid';
import { useContext } from 'react';
import { Actions, GridContext } from './GridContext';

export const Cell = ({
  column,
  columnIndex,
  rowIndex,
  style,
  data,
  handleDoubleClick,
}: {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: any;
  data: any;
  handleDoubleClick: Function;
}) => {
  const { state, dispatch } = useContext(GridContext);
  const { currentCell, selectedColumns } = state;

  const columnId = column.columnId;
  const isCellSelected = selectedColumns.includes(columnId);

  const currentActiveCell =
    currentCell.row === rowIndex && currentCell.column === columnIndex;
  // const isCellSelected = isCurrentColumnSelected;

  const value = data[rowIndex][columnId];

  if (rowIndex === 1 || (rowIndex === 2 && columnId === 'A')) {
    console.log({ rowIndex, columnId, value });
  }

  return (
    <Flex
      alignItems={'center'}
      w={60}
      height={6}
      px={1}
      borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      borderLeftWidth={isCellSelected ? '1px' : '0'}
      backgroundColor={isCellSelected ? 'rgba(53,121,248,.35)' : 'transparent'}
      borderBottomWidth={'0.4px'}
      borderColor={
        isCellSelected || currentActiveCell ? 'blue.500' : 'grey.700'
      }
      fontSize={'xs-12'}
      borderWidth={currentActiveCell ? '2px' : ''}
      color={'grey.800'}
      style={style}
      textOverflow={'hidden'}
      overflow={'hidden'}
      whiteSpace={'nowrap'}
      onClick={(e) => handleDoubleClick(e, rowIndex, columnIndex, value)}
      // onClick={handleCellClick}
    >
      {value}
    </Flex>
  );
};
