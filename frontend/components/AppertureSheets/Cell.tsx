import { Flex } from '@chakra-ui/react';
import { Column } from './grid';
import { useContext } from 'react';
import { Actions, GridContext } from './GridContext';

export const Cell = ({
  column,
  columnIndex,
  rowIndex,
  style,
  handleDoubleClick,
}: {
  column: Column;
  columnIndex: number;
  rowIndex: number;
  style: any;
  handleDoubleClick: Function;
}) => {
  const { state, dispatch } = useContext(GridContext);
  const { currentCell, selectedColumns } = state;

  const columnId = column.columnId;
  const isCurrentColumnSelected = selectedColumns.includes(columnId);

  const currentActiveCell =
    currentCell.row === rowIndex && currentCell.column === columnIndex;
  const isCellSelected = isCurrentColumnSelected;

  const handleCellClick = () => {
    dispatch({
      type: Actions.SET_CURRENT_CELL,
      payload: {
        column: columnIndex,
        row: rowIndex,
      },
    });

    dispatch({ type: Actions.SET_SELECTED_COLUMNS, payload: [] });
  };

  return (
    <Flex
      //   ref={(el) =>
      //     currentActiveCell &&
      //     el?.scrollIntoView({
      //       behavior: 'instant',
      //       block: 'nearest',
      //       inline: 'nearest',
      //     })
      //   }
      alignItems={'center'}
      w={60}
      height={6}
      borderRightWidth={isCellSelected ? '1px' : '0.4px'}
      borderLeftWidth={isCellSelected ? '1px' : '0'}
      backgroundColor={isCellSelected ? 'rgba(53,121,248,.35)' : 'transparent'}
      borderBottomWidth={'0.4px'}
      borderColor={
        isCellSelected || currentActiveCell ? 'blue.500' : 'grey.700'
      }
      borderWidth={currentActiveCell ? '2px' : ''}
      color={'grey.800'}
      style={style}
      onDoubleClick={(e) => handleDoubleClick(e, rowIndex, columnIndex)}
      onClick={handleCellClick}
    >
      Item {rowIndex},{columnIndex}
    </Flex>
  );
};
